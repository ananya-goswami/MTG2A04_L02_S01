"""Swifty animation tools for this game - one file (review 2026-09-29: "can we include these codes somewhere in our files
only"). Merged, unchanged, from the six scripts that used to sit in podc/tools/ (27-28 Sep): they were used to make and
check Swifty's animation files (assets/gif/*.webp), e.g. the peeking clip. The game itself never loads this file.

Usage:  python tools/swifty_anim_tools.py <command> ...      (python tools/swifty_anim_tools.py -h  lists them)
  inspect       INPUT OUT.jpg [--samples N --thumb PX]     contact sheet of evenly spaced frames, with their times
  audit         INPUT OUTDIR  [--columns --rows --thumb]   every frame as PNG + frame_metrics.csv + contact sheets + audit_report.txt of the biggest frame-to-frame changes
  extract       INPUT OUTDIR FRAME [FRAME ...]             save chosen frames as PNGs
  blinks        INPUT.gif OUTPUT.gif [--preview-dir D --backup F]   add natural 5-step blinks to the two held poses of the 67-frame Swifty GIF
  smooth-hands  INPUT.png OUTPUT.png                       rebuild both hand silhouettes of one frame with even outlines
  build         INPUT.webp OUTPUT.gif                      build the finished peeking Swifty GIF from the 114-frame source webp: blinks, talking timing, smooth hands, 1500px
Needs: Pillow, numpy, scipy.
"""
from __future__ import annotations

import argparse
import csv
import math
import shutil
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage
from scipy.spatial import ConvexHull


# ==============================================================================================================
# blinks  (was add_natural_blinks.py)
# ==============================================================================================================

# The two held poses in swifty_work/final.gif. Each original hold is replaced by
# a five-step blink whose durations add up to the original duration.
BLINKS = {
    22: {
        "durations": [80, 40, 80, 40, 120],
        "eyes": [(289, 746, 426, 902), (530, 746, 668, 902)],
        "preserve_hands": [
            ((168, 846, 330, 970), (250, 905)),
            ((625, 846, 790, 970), (710, 905)),
        ],
    },
    52: {
        "durations": [120, 40, 80, 40, 160],
        "eyes": [(298, 579, 431, 714), (524, 579, 657, 714)],
    },
}


def load_gif(path: Path) -> tuple[list[Image.Image], list[int], int]:
    image = Image.open(path)
    loop = int(image.info.get("loop", 0))
    frames: list[Image.Image] = []
    durations: list[int] = []
    for index in range(image.n_frames):
        image.seek(index)
        frames.append(image.convert("RGB"))
        durations.append(int(image.info.get("duration", 40)))
    return frames, durations, loop


def ellipse_mask(size: tuple[int, int], box: tuple[int, int, int, int], pad: int = 5) -> Image.Image:
    x0, y0, x1, y1 = box
    mask = Image.new("L", size, 0)
    ImageDraw.Draw(mask).ellipse((x0 - pad, y0 - pad, x1 + pad, y1 + pad), fill=255)
    return mask


def eye_shape_mask(image: Image.Image, box: tuple[int, int, int, int]) -> Image.Image:
    """Trace the existing navy outer eye ring, fill it, and add a tiny AA-safe margin."""
    x0, y0, x1, y1 = box
    margin = 12
    rx0, ry0 = max(0, x0 - margin), max(0, y0 - margin)
    rx1, ry1 = min(image.width, x1 + margin), min(image.height, y1 + margin)
    pixels = np.asarray(image)[ry0:ry1, rx0:rx1]
    dark = (pixels[:, :, 0] < 55) & (pixels[:, :, 1] < 105) & (pixels[:, :, 2] < 145)
    labels, count = ndimage.label(dark)
    candidates: list[tuple[int, int]] = []
    for label in range(1, count + 1):
        ys, xs = np.nonzero(labels == label)
        if not len(xs):
            continue
        width, height = xs.max() - xs.min() + 1, ys.max() - ys.min() + 1
        if width > (x1 - x0) * 0.62 and height > (y1 - y0) * 0.62:
            candidates.append((width * height, label))
    if not candidates:
        return ellipse_mask(image.size, box)

    component = labels == max(candidates)[1]
    cy, cx = np.nonzero(component)
    hull = ConvexHull(np.column_stack((cx, cy)))
    polygon = [(int(cx[index]), int(cy[index])) for index in hull.vertices]
    hull_image = Image.new("L", (rx1 - rx0, ry1 - ry0), 0)
    ImageDraw.Draw(hull_image).polygon(polygon, fill=255)
    filled = np.asarray(hull_image) > 0
    # Include the pale blue lower-eye shadow/antialias that sits just outside the
    # dark outline, while leaving the warm pink cheek and orange beak untouched.
    blue_edge = pixels[:, :, 2].astype(np.int16) > pixels[:, :, 0].astype(np.int16) + 7
    near_eye = ndimage.binary_dilation(filled, iterations=12)
    filled |= ndimage.binary_dilation(blue_edge & near_eye, iterations=2)

    # The source artwork has a nearly pure-white lower sclera highlight just
    # beyond the navy outline. Include its central portion so it cannot survive
    # as a white fold, while excluding the hands at the outer sides of the eyes.
    spread = pixels.max(axis=2).astype(np.int16) - pixels.min(axis=2).astype(np.int16)
    white_sclera = (pixels.min(axis=2) > 240) & (spread < 7)
    local_x0, local_x1 = x0 - rx0, x1 - rx0
    local_y0, local_y1 = y0 - ry0, y1 - ry0
    central = np.zeros_like(white_sclera)
    inset = max(1, round((x1 - x0) * 0.23))
    central[
        max(0, local_y0):min(central.shape[0], local_y1),
        max(0, local_x0 + inset):min(central.shape[1], local_x1 - inset),
    ] = True
    filled |= ndimage.binary_dilation(white_sclera & central & near_eye, iterations=2)
    filled = ndimage.binary_dilation(filled, iterations=5)
    mask_array = np.zeros((image.height, image.width), dtype=np.uint8)
    mask_array[ry0:ry1, rx0:rx1] = filled.astype(np.uint8) * 255
    return Image.fromarray(mask_array, "L")


def smooth_face_fill(image: Image.Image, mask: Image.Image) -> Image.Image:
    """Fit the surrounding ivory feather color across the eye—no dark-edge smearing."""
    source = np.asarray(image, dtype=np.float32)
    inside = np.asarray(mask) > 0
    ys, xs = np.nonzero(inside)
    if not len(xs):
        return image.copy()

    x0, x1 = max(0, xs.min() - 35), min(image.width, xs.max() + 36)
    y0, y1 = max(0, ys.min() - 35), min(image.height, ys.max() + 36)
    patch = source[y0:y1, x0:x1]
    patch_inside = inside[y0:y1, x0:x1]
    yy, xx = np.mgrid[y0:y1, x0:x1]

    # Bright, low-saturation pixels are the white/cream face and exclude the navy
    # eye, beak, blush, hands and background around these two poses.
    spread = patch.max(axis=2) - patch.min(axis=2)
    warm_cream = patch[:, :, 0].astype(np.int16) - patch[:, :, 2].astype(np.int16) > 5
    valid = (~patch_inside) & (patch[:, :, 0] > 205) & (patch[:, :, 1] > 195) & (patch[:, :, 2] > 175) & (spread < 48) & warm_cream
    vy, vx = np.nonzero(valid)
    if len(vx) < 40:
        fill = np.full_like(patch, np.median(patch[~patch_inside], axis=0))
    else:
        nx = (vx + x0 - (x0 + x1) / 2) / max(1, x1 - x0)
        ny = (vy + y0 - (y0 + y1) / 2) / max(1, y1 - y0)
        design = np.column_stack((np.ones_like(nx), nx, ny, nx * nx, ny * ny, nx * ny))
        coefficients = np.linalg.lstsq(design, patch[vy, vx], rcond=None)[0]
        gx = (xx - (x0 + x1) / 2) / max(1, x1 - x0)
        gy = (yy - (y0 + y1) / 2) / max(1, y1 - y0)
        grid = np.stack((np.ones_like(gx), gx, gy, gx * gx, gy * gy, gx * gy), axis=-1)
        fill = grid @ coefficients

    output = source.copy()
    output_patch = output[y0:y1, x0:x1]
    output_patch[patch_inside] = np.clip(fill[patch_inside], 0, 255)
    output[y0:y1, x0:x1] = output_patch
    return Image.fromarray(output.astype(np.uint8), "RGB")


def draw_antialiased_curve(
    image: Image.Image,
    points: list[tuple[float, float]],
    color: tuple[int, int, int],
    width: int,
    scale: int = 4,
) -> Image.Image:
    overlay = Image.new("RGBA", (image.width * scale, image.height * scale), (0, 0, 0, 0))
    scaled_points = [(round(x * scale), round(y * scale)) for x, y in points]
    ImageDraw.Draw(overlay).line(scaled_points, fill=(*color, 255), width=width * scale, joint="curve")
    overlay = overlay.resize(image.size, Image.Resampling.LANCZOS)
    return Image.alpha_composite(image.convert("RGBA"), overlay).convert("RGB")


def restore_foreground_hands(
    result: Image.Image,
    base: Image.Image,
    hand_specs: list[tuple[tuple[int, int, int, int], tuple[int, int]]],
) -> Image.Image:
    """Restore the original hand pixels after the eye edit so overlap seams cannot appear."""
    base_array = np.asarray(base)
    preserve = np.zeros((base.height, base.width), dtype=bool)

    for (x0, y0, x1, y1), (seed_x, seed_y) in hand_specs:
        roi = base_array[y0:y1, x0:x1]
        spread = roi.max(axis=2).astype(np.int16) - roi.min(axis=2).astype(np.int16)
        bright = (roi.min(axis=2) > 225) & (spread < 36)
        labels, count = ndimage.label(bright)

        local_seed = (seed_y - y0, seed_x - x0)
        label = 0
        if 0 <= local_seed[0] < bright.shape[0] and 0 <= local_seed[1] < bright.shape[1]:
            label = int(labels[local_seed])
        if label == 0:
            candidates = []
            for current in range(1, count + 1):
                ys, xs = np.nonzero(labels == current)
                if len(xs) > 30:
                    distance = (xs.mean() - local_seed[1]) ** 2 + (ys.mean() - local_seed[0]) ** 2
                    candidates.append((distance, current))
            if candidates:
                label = min(candidates)[1]
        if label == 0:
            continue

        core = labels == label
        near_core = ndimage.binary_dilation(core, iterations=11)
        blue_outline = (
            (roi[:, :, 2].astype(np.int16) > roi[:, :, 0].astype(np.int16) + 8)
            & (roi[:, :, 2].astype(np.int16) > roi[:, :, 1].astype(np.int16) + 3)
        )
        neutral_shading = (roi.min(axis=2) > 145) & (spread < 34)
        hand = core | (near_core & (blue_outline | neutral_shading))
        hand = ndimage.binary_dilation(hand, iterations=1)
        preserve[y0:y1, x0:x1] |= hand

    mask = Image.fromarray(preserve.astype(np.uint8) * 255, "L")
    output = result.copy()
    output.paste(base, (0, 0), mask)
    return output


def quadratic_points(
    start: tuple[float, float],
    control: tuple[float, float],
    end: tuple[float, float],
    count: int = 48,
) -> list[tuple[float, float]]:
    points = []
    for t in np.linspace(0.0, 1.0, count):
        mt = 1.0 - t
        points.append(
            (
                mt * mt * start[0] + 2 * mt * t * control[0] + t * t * end[0],
                mt * mt * start[1] + 2 * mt * t * control[1] + t * t * end[1],
            )
        )
    return points


def make_blink_frame(
    base: Image.Image,
    boxes: list[tuple[int, int, int, int]],
    progress: float,
    preserve_hands: list[tuple[tuple[int, int, int, int], tuple[int, int]]] | None = None,
) -> Image.Image:
    result = base.copy()
    for box in boxes:
        x0, y0, x1, y1 = box
        width, height = x1 - x0, y1 - y0
        cx = (x0 + x1) / 2

        full_mask = eye_shape_mask(base, box)
        clean_face = smooth_face_fill(base, full_mask)

        if progress >= 0.99:
            # Feather only the outside of the erased oval; the eye itself is fully covered.
            soft = full_mask
            result.paste(clean_face, (0, 0), soft)
            line_y = y0 + height * 0.60
            rise = height * 0.25
            start = (x0 + width * 0.04, line_y + height * 0.04)
            control = (cx, line_y - rise)
            end = (x1 - width * 0.04, line_y + height * 0.04)
            stroke = max(8, round(width * 0.085))
        else:
            # Transitional blink: erase the complete eyeball first, then draw a
            # flatter lid. This deliberately leaves no lower sclera/white crescent
            # or fold beneath the eyelid.
            result.paste(clean_face, (0, 0), full_mask)
            line_y = y0 + height * 0.66
            rise = height * 0.10
            left = x0 + width * 0.02
            right = x1 - width * 0.02
            curve = quadratic_points((left, line_y), (cx, line_y - rise), (right, line_y))
            start, control, end = curve[0], (cx, line_y - rise), curve[-1]
            stroke = max(7, round(width * 0.075))

        # Use the same deep navy as the eye outline sampled from the base art.
        sample = np.asarray(base)
        roi = sample[max(0, y0):min(base.height, y1), max(0, x0):min(base.width, x1)]
        dark = roi[(roi[:, :, 0] < 35) & (roi[:, :, 1] < 75) & (roi[:, :, 2] < 110)]
        navy = tuple(np.median(dark, axis=0).astype(int)) if len(dark) else (4, 39, 65)
        curve = quadratic_points(start, control, end)
        result = draw_antialiased_curve(result, curve, navy, stroke)

    if preserve_hands:
        result = restore_foreground_hands(result, base, preserve_hands)
    return result


def save_gif(
    frames: list[Image.Image],
    palette_references: list[Image.Image],
    durations: list[int],
    loop: int | None,
    output: Path,
) -> None:
    # Each frame uses the palette of its untouched source pose. This keeps every
    # pixel outside the eyelids byte-for-byte stable and avoids dither grain.
    paletted = []
    for frame, reference in zip(frames, palette_references):
        if frame is reference:
            paletted.append(
                frame.quantize(
                    colors=256,
                    method=Image.Quantize.MEDIANCUT,
                    dither=Image.Dither.NONE,
                )
            )
        else:
            palette = reference.quantize(
                colors=256,
                method=Image.Quantize.MEDIANCUT,
                dither=Image.Dither.NONE,
            )
            candidate = frame.quantize(palette=palette, dither=Image.Dither.NONE)
            # Preserve the source palette indices everywhere we did not paint.
            # This prevents whole-frame color shimmer during the 40 ms eyelid frames.
            source_indices = np.array(palette, copy=True)
            candidate_indices = np.asarray(candidate)
            changed = np.any(np.asarray(frame) != np.asarray(reference), axis=2)
            source_indices[changed] = candidate_indices[changed]
            merged = Image.fromarray(source_indices.astype(np.uint8), "P")
            merged.putpalette(palette.getpalette())
            paletted.append(merged)
    for frame in paletted:
        frame.info.clear()
    output.parent.mkdir(parents=True, exist_ok=True)
    save_options = {
        "save_all": True,
        "append_images": paletted[1:],
        "duration": durations,
        "disposal": 1,
        "optimize": False,
    }
    if loop is not None:
        save_options["loop"] = loop
    paletted[0].save(output, **save_options)


def save_previews(
    output_dir: Path,
    base: Image.Image,
    boxes: list[tuple[int, int, int, int]],
    label: str,
    preserve_hands: list[tuple[tuple[int, int, int, int], tuple[int, int]]] | None = None,
) -> None:
    output_dir.mkdir(parents=True, exist_ok=True)
    for suffix, progress in (("half", 0.58), ("closed", 1.0)):
        make_blink_frame(base, boxes, progress, preserve_hands).save(output_dir / f"{label}_{suffix}.png")


def cmd_blinks(args) -> None:

    frames, durations, loop = load_gif(args.input)
    if len(frames) != 67:
        raise SystemExit(f"Expected 67 frames, found {len(frames)}")

    if args.preview_dir:
        for index, spec in BLINKS.items():
            save_previews(
                args.preview_dir,
                frames[index],
                spec["eyes"],
                f"frame_{index:03d}",
                spec.get("preserve_hands"),
            )

    rebuilt_frames: list[Image.Image] = []
    palette_references: list[Image.Image] = []
    rebuilt_durations: list[int] = []
    for index, (frame, duration) in enumerate(zip(frames, durations)):
        if index not in BLINKS:
            rebuilt_frames.append(frame)
            palette_references.append(frame)
            rebuilt_durations.append(duration)
            continue

        spec = BLINKS[index]
        if sum(spec["durations"]) != duration:
            raise SystemExit(
                f"Blink durations for frame {index} sum to {sum(spec['durations'])}ms, expected {duration}ms"
            )
        sequence = [
            frame,
            make_blink_frame(frame, spec["eyes"], 0.58, spec.get("preserve_hands")),
            make_blink_frame(frame, spec["eyes"], 1.0, spec.get("preserve_hands")),
            make_blink_frame(frame, spec["eyes"], 0.58, spec.get("preserve_hands")),
            frame,
        ]
        rebuilt_frames.extend(sequence)
        palette_references.extend([frame] * len(sequence))
        rebuilt_durations.extend(spec["durations"])

    if args.backup and args.input.resolve() == args.output.resolve() and not args.backup.exists():
        shutil.copy2(args.input, args.backup)
    save_gif(rebuilt_frames, palette_references, rebuilt_durations, loop, args.output)
    print(f"saved={args.output}")
    print(f"frames={len(rebuilt_frames)} duration_ms={sum(rebuilt_durations)} loop={loop}")


# ==============================================================================================================
# smooth-hands  (was smooth_hand_outlines.py)
# ==============================================================================================================

HAND_ROIS = (
    (120, 790, 370, 995),
    (590, 790, 840, 995),
)


def _component_nearest_center(mask: np.ndarray, center: tuple[float, float]) -> np.ndarray | None:
    labels, count = ndimage.label(mask)
    if not count:
        return None
    cy, cx = center
    candidates: list[tuple[float, int]] = []
    for label in range(1, count + 1):
        ys, xs = np.nonzero(labels == label)
        if len(xs) < 250:
            continue
        width = xs.max() - xs.min() + 1
        height = ys.max() - ys.min() + 1
        if width > 190 or height > 145:
            continue
        distance = (xs.mean() - cx) ** 2 + (ys.mean() - cy) ** 2
        candidates.append((distance, label))
    if not candidates:
        return None
    return labels == min(candidates)[1]


def _soft_mask(mask: np.ndarray, sigma: float, threshold: float = 0.5) -> np.ndarray:
    """Regularize a contour and return antialiased coverage in the 0..1 range."""
    field = ndimage.gaussian_filter(mask.astype(np.float32), sigma=sigma)
    # A narrow smoothstep retains antialiasing without making the art hazy.
    low, high = threshold - 0.18, threshold + 0.18
    coverage = np.clip((field - low) / (high - low), 0.0, 1.0)
    return coverage * coverage * (3.0 - 2.0 * coverage)


def smooth_hand_outlines(frame: Image.Image) -> Image.Image:
    """Rebuild both hand silhouettes with even blue contours and smooth AA edges."""
    output = np.asarray(frame.convert("RGB"), dtype=np.float32).copy()
    original = output.copy()

    for x0, y0, x1, y1 in HAND_ROIS:
        roi = original[y0:y1, x0:x1]
        minimum = roi.min(axis=2)
        maximum = roi.max(axis=2)
        spread = maximum - minimum

        # The bright, low-saturation hand fill is isolated from the yellow hoodie,
        # dark ledge and black background. Choose the component nearest the hand.
        bright = (minimum > 188) & (spread < 72)
        core = _component_nearest_center(
            bright,
            ((y1 - y0) * 0.61, (x1 - x0) * 0.50),
        )
        if core is None or core.sum() < 1200:
            continue

        near_core = ndimage.binary_dilation(core, iterations=18)
        blue = (
            (roi[:, :, 2] > roi[:, :, 0] + 22)
            & (roi[:, :, 2] > roi[:, :, 1] + 8)
            & (roi[:, :, 0] < 160)
        )
        # Keep the three-finger silhouette, including its two blue separations.
        # Smoothing this inner shape independently makes the outline thickness even.
        inner_binary = ndimage.binary_closing(core, iterations=1)
        inner = _soft_mask(inner_binary, sigma=1.15)

        # Build the outer silhouette from the clean fill instead of following the
        # nearby horizontal ledge. This gives every edge a uniform 9 px contour.
        outer_binary = ndimage.binary_dilation(inner_binary, iterations=9)
        outer = _soft_mask(outer_binary, sigma=1.45)
        inner *= outer

        blue_samples = roi[blue & near_core]
        outline = (
            np.median(blue_samples, axis=0)
            if len(blue_samples)
            else np.array((83.0, 133.0, 163.0), dtype=np.float32)
        )

        # Composite a clean blue silhouette first, then restore the original white
        # fill and gentle gray shading through the regularized inner contour.
        patch = output[y0:y1, x0:x1]
        patch[:] = patch * (1.0 - outer[:, :, None]) + outline * outer[:, :, None]
        patch[:] = patch * (1.0 - inner[:, :, None]) + roi * inner[:, :, None]
        output[y0:y1, x0:x1] = patch

    return Image.fromarray(np.clip(output, 0, 255).astype(np.uint8), "RGB")


def cmd_smooth_hands(args) -> None:
    image = Image.open(args.input).convert("RGB")
    args.output.parent.mkdir(parents=True, exist_ok=True)
    smooth_hand_outlines(image).save(args.output)
    print(f"saved={args.output}")


# ==============================================================================================================
# build  (was build_complete_swifty_gif.py - uses the blinks and smooth-hands code above)
# ==============================================================================================================

def load_webp(path: Path) -> tuple[list[Image.Image], list[int], int]:
    animation = Image.open(path)
    frames: list[Image.Image] = []
    durations: list[int] = []
    loop = int(animation.info.get("loop", 0))
    for index in range(animation.n_frames):
        animation.seek(index)
        rgba = animation.convert("RGBA")
        duration = int(animation.info.get("duration", 0))
        black = Image.new("RGBA", rgba.size, (0, 0, 0, 255))
        frames.append(Image.alpha_composite(black, rgba).convert("RGB"))
        durations.append(duration)
    return frames, durations, loop


def cmd_build(args) -> None:

    source, source_durations, loop = load_webp(args.input)
    if len(source) != 114:
        raise SystemExit(f"Expected the 114-frame complete source, found {len(source)} frames")

    output_frames: list[Image.Image] = []
    palette_references: list[Image.Image] = []
    output_durations: list[int] = []

    def append(frame: Image.Image, duration: int, reference: Image.Image | None = None) -> None:
        output_frames.append(frame)
        palette_references.append(reference if reference is not None else frame)
        output_durations.append(duration)

    # Hidden-to-peek rise and the held open-eye pose.
    for index in range(20):
        append(source[index], source_durations[index])

    # First corrected blink at the ledge. Keep the original 190 ms timing and
    # restore the hands after painting so no white overlap wedges can flash.
    first_base = source[19]
    first = BLINKS[22]
    for progress, duration in zip((0.58, 1.0, 0.58), source_durations[20:23]):
        append(
            make_blink_frame(
                first_base,
                first["eyes"],
                progress,
                first.get("preserve_hands"),
            ),
            duration,
            first_base,
        )

    # Pupil motion, rise and tilt through the second open-eye hold.
    for index in range(23, 54):
        append(source[index], source_durations[index])

    # Second corrected blink after Swifty is fully up and tilted. This replaces
    # the source's doubled eyelid/slit frames while retaining its 190 ms timing.
    second_base = source[53]
    second = BLINKS[52]
    for progress, duration in zip((0.58, 1.0, 0.58), source_durations[54:57]):
        append(
            make_blink_frame(second_base, second["eyes"], progress),
            duration,
            second_base,
        )

    # Open after the blink, then exactly four seconds of cute talking. Rebuild
    # the blink inside this beat from a clean open-eye pose so no upper-eye
    # fragments from the authored source can flash above the eyelids.
    append(source[57], source_durations[57])
    talking_blink_base = source[62]
    talking_blink_progress = {63: 0.58, 64: 1.0, 65: 0.58}
    # Keep the mid-sentence pause brief. The original 640 ms closed-mouth hold,
    # plus its neighboring closed frame, read as if Swifty stopped talking. Move
    # that time into four open-mouth beats so the delivery stays cute and fluid.
    talking_duration_adjustments = {
        67: 90,
        69: 90,
        71: 90,
        73: -360,
        74: 90,
        78: 80,
    }
    for index in range(58, 79):
        duration = source_durations[index] + talking_duration_adjustments.get(index, 0)
        if index in talking_blink_progress:
            append(
                make_blink_frame(
                    talking_blink_base,
                    second["eyes"],
                    talking_blink_progress[index],
                ),
                duration,
                talking_blink_base,
            )
        else:
            append(source[index], duration)

    # Rebuild the settling blink too, then hold the clean open-eyed cute pose.
    settling_base = source[78]
    for index, progress in zip(range(79, 82), (0.58, 1.0, 0.58)):
        append(
            make_blink_frame(settling_base, second["eyes"], progress),
            source_durations[index],
            settling_base,
        )
    append(source[82], source_durations[82])

    # Finish on the clean open-eyed pose. With no GIF loop extension, playback
    # stops here and Swifty remains visible instead of ducking below the ledge.
    append(source[99], 1200)
    output_loop = None

    # Clean the hand silhouettes before quantization, then render at 1.5x. The
    # additional pixels keep the rounded contours smooth when the GIF is scaled
    # inside the UI, while each frame retains its own full 256-color palette.
    high_quality_size = (1500, 1500)
    refined_cache: dict[int, Image.Image] = {}

    def refine(image: Image.Image) -> Image.Image:
        key = id(image)
        if key not in refined_cache:
            cleaned = smooth_hand_outlines(image)
            refined_cache[key] = cleaned.resize(high_quality_size, Image.Resampling.LANCZOS)
        return refined_cache[key]

    high_quality_frames = [refine(frame) for frame in output_frames]
    high_quality_references = [refine(reference) for reference in palette_references]
    save_gif(
        high_quality_frames,
        high_quality_references,
        output_durations,
        output_loop,
        args.output,
    )
    print(f"saved={args.output}")
    print(f"frames={len(output_frames)} duration_ms={sum(output_durations)} loop=none")
    print("talking_target_ms=4000")


# ==============================================================================================================
# audit  (was audit_animation.py)
# ==============================================================================================================

def visible_bbox(frame: Image.Image, threshold: int = 24):
    alpha = np.asarray(frame.getchannel("A"))
    ys, xs = np.nonzero(alpha >= threshold)
    if not len(xs):
        return None
    return int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())


def on_white(frame: Image.Image) -> np.ndarray:
    bg = Image.new("RGBA", frame.size, (255, 255, 255, 255))
    return np.asarray(Image.alpha_composite(bg, frame).convert("RGB"), dtype=np.int16)


def cmd_audit(args) -> None:

    args.output.mkdir(parents=True, exist_ok=True)
    frames_dir = args.output / "frames"
    frames_dir.mkdir(parents=True, exist_ok=True)

    animation = Image.open(args.input)
    frames: list[Image.Image] = []
    durations: list[int] = []
    for index in range(animation.n_frames):
        animation.seek(index)
        frame = animation.convert("RGBA")
        frames.append(frame)
        durations.append(int(animation.info.get("duration", 0)))
        frame.save(frames_dir / f"frame_{index:03d}.png")

    rgb = [on_white(frame) for frame in frames]
    diffs = [0.0]
    for index in range(1, len(rgb)):
        diffs.append(float(np.abs(rgb[index] - rgb[index - 1]).mean()))

    elapsed = 0
    with (args.output / "frame_metrics.csv").open("w", newline="", encoding="utf-8") as handle:
        writer = csv.writer(handle)
        writer.writerow(["frame", "start_ms", "duration_ms", "mean_abs_diff", "visible_bbox"])
        for index, (frame, duration, diff) in enumerate(zip(frames, durations, diffs)):
            writer.writerow([index, elapsed, duration, f"{diff:.6f}", visible_bbox(frame)])
            elapsed += duration

    per_page = args.columns * args.rows
    label_height = 24
    for page_start in range(0, len(frames), per_page):
        selected = range(page_start, min(page_start + per_page, len(frames)))
        sheet = Image.new("RGB", (args.columns * args.thumb,
                                  args.rows * (args.thumb + label_height)), "#eef1f6")
        draw = ImageDraw.Draw(sheet)
        for slot, index in enumerate(selected):
            frame = frames[index].copy()
            frame.thumbnail((args.thumb, args.thumb), Image.Resampling.LANCZOS)
            tile = Image.new("RGBA", (args.thumb, args.thumb), "white")
            tile.alpha_composite(frame, ((args.thumb - frame.width) // 2,
                                         (args.thumb - frame.height) // 2))
            x = (slot % args.columns) * args.thumb
            y = (slot // args.columns) * (args.thumb + label_height)
            sheet.paste(tile.convert("RGB"), (x, y))
            draw.text((x + 5, y + args.thumb + 4),
                      f"{index:03d} {durations[index]}ms d={diffs[index]:.2f}",
                      fill="#172033")
        page = page_start // per_page + 1
        sheet.save(args.output / f"contact_sheet_{page:02d}.jpg", quality=94)

    ranked = sorted(range(1, len(diffs)), key=lambda i: diffs[i], reverse=True)[:15]
    report = [
        f"input: {args.input}",
        f"frames: {len(frames)}",
        f"duration_ms: {sum(durations)}",
        f"duration_counts: {dict(sorted({d: durations.count(d) for d in set(durations)}.items()))}",
        "largest_frame_changes:",
    ]
    report.extend(f"  {index - 1:03d}->{index:03d}: {diffs[index]:.6f}"
                  for index in ranked)
    (args.output / "audit_report.txt").write_text("\n".join(report) + "\n", encoding="utf-8")
    print("\n".join(report))


# ==============================================================================================================
# extract  (was extract_selected_frames.py)
# ==============================================================================================================

def cmd_extract(args) -> None:

    args.output.mkdir(parents=True, exist_ok=True)
    animation = Image.open(args.input)
    for index in args.frames:
        animation.seek(index)
        animation.convert("RGBA").save(args.output / f"frame_{index:03d}.png")


# ==============================================================================================================
# inspect  (was inspect_animation.py)
# ==============================================================================================================

def cmd_inspect(args) -> None:

    source = Image.open(args.input)
    frame_count = getattr(source, "n_frames", 1)
    sample_count = min(args.samples, frame_count)
    indices = sorted({round(i * (frame_count - 1) / max(1, sample_count - 1)) for i in range(sample_count)})

    columns = min(4, len(indices))
    rows = math.ceil(len(indices) / columns)
    label_height = 28
    sheet = Image.new("RGBA", (columns * args.thumb, rows * (args.thumb + label_height)), (238, 241, 246, 255))
    draw = ImageDraw.Draw(sheet)

    elapsed = 0
    timings: list[int] = []
    for index in range(frame_count):
        source.seek(index)
        timings.append(int(source.info.get("duration", 100)))

    for position, index in enumerate(indices):
        source.seek(index)
        frame = source.convert("RGBA")
        frame.thumbnail((args.thumb, args.thumb), Image.Resampling.LANCZOS)
        x = (position % columns) * args.thumb
        y = (position // columns) * (args.thumb + label_height)
        checker = Image.new("RGBA", (args.thumb, args.thumb), (255, 255, 255, 255))
        checker.paste(frame, ((args.thumb - frame.width) // 2, (args.thumb - frame.height) // 2), frame)
        sheet.paste(checker, (x, y))
        time_ms = sum(timings[:index])
        draw.text((x + 8, y + args.thumb + 5), f"frame {index:02d}  {time_ms / 1000:.1f}s", fill=(25, 35, 55, 255))

    args.output.parent.mkdir(parents=True, exist_ok=True)
    sheet.convert("RGB").save(args.output, quality=95)
    print(f"Wrote {args.output} ({frame_count} frames, {sum(timings)} ms)")


def main() -> None:
    parser = argparse.ArgumentParser(description="Swifty animation tools (see the top of this file).")
    sub = parser.add_subparsers(dest="command", required=True)

    p = sub.add_parser('inspect', help='contact sheet of evenly spaced frames, with their times (was inspect_animation.py)')
    p.add_argument("input", type=Path)
    p.add_argument("output", type=Path)
    p.add_argument("--samples", type=int, default=16)
    p.add_argument("--thumb", type=int, default=220)
    p.set_defaults(func=cmd_inspect)

    p = sub.add_parser('audit', help='every frame as PNG + frame_metrics.csv + contact sheets + audit_report.txt of the biggest frame-to-frame changes (was audit_animation.py)')
    p.add_argument("input", type=Path)
    p.add_argument("output", type=Path)
    p.add_argument("--columns", type=int, default=6)
    p.add_argument("--rows", type=int, default=5)
    p.add_argument("--thumb", type=int, default=160)
    p.set_defaults(func=cmd_audit)

    p = sub.add_parser('extract', help='save chosen frames as PNGs (was extract_selected_frames.py)')
    p.add_argument("input", type=Path)
    p.add_argument("output", type=Path)
    p.add_argument("frames", nargs="+", type=int)
    p.set_defaults(func=cmd_extract)

    p = sub.add_parser('blinks', help='add natural 5-step blinks to the two held poses of the 67-frame Swifty GIF (was add_natural_blinks.py)')
    p.add_argument("input", type=Path)
    p.add_argument("output", type=Path)
    p.add_argument("--preview-dir", type=Path)
    p.add_argument("--backup", type=Path)
    p.set_defaults(func=cmd_blinks)

    p = sub.add_parser('smooth-hands', help='rebuild both hand silhouettes of one frame with even outlines (was smooth_hand_outlines.py)')
    p.add_argument("input", type=Path)
    p.add_argument("output", type=Path)
    p.set_defaults(func=cmd_smooth_hands)

    p = sub.add_parser('build', help='build the finished peeking Swifty GIF from the 114-frame source webp: blinks, talking timing, smooth hands, 1500px (was build_complete_swifty_gif.py)')
    p.add_argument("input", type=Path)
    p.add_argument("output", type=Path)
    p.set_defaults(func=cmd_build)

    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
