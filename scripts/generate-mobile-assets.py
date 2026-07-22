#!/usr/bin/env python3
"""
Generate HabitFlow app icons & splash screens for the Capacitor mobile apps.

Usage:  python3 scripts/generate-mobile-assets.py
Needs:  pip install pillow
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageOps

ROOT = Path(__file__).resolve().parent.parent
MOBILE = ROOT / 'mobile'

GRAD_TOP = (99, 102, 241)    # #6366f1
GRAD_BOT = (139, 92, 246)    # #8b5cf6
SHELL = (16, 18, 38)         # #101226
WHITE = (255, 255, 255)

SUPER = 4  # supersampling factor for crisp edges


def gradient_rounded_square(size, radius_ratio=0.22):
    """Rounded-square icon body with a vertical violet gradient (fast ramp)."""
    s = size * SUPER
    ramp = Image.linear_gradient('L').resize((s, s), Image.BICUBIC)
    grad = ImageOps.colorize(ramp, GRAD_TOP, GRAD_BOT).convert('RGBA')
    mask = Image.new('L', (s, s), 0)
    d = ImageDraw.Draw(mask)
    d.rounded_rectangle([0, 0, s - 1, s - 1], radius=s * radius_ratio, fill=255)
    img = Image.new('RGBA', (s, s), (0, 0, 0, 0))
    img.paste(grad, (0, 0), mask)
    return img


def draw_check(img, color=WHITE, box_ratio=0.58, width_ratio=0.105):
    """Draw the bold white check centered in the image."""
    s = img.size[0]
    d = ImageDraw.Draw(img)
    w = s * box_ratio
    x0 = (s - w) / 2
    y0 = (s - w) / 2
    sw = s * width_ratio
    pts = [
        (x0 + w * 0.02, y0 + w * 0.55),
        (x0 + w * 0.38, y0 + w * 0.92),
        (x0 + w * 0.98, y0 + w * 0.10),
    ]
    d.line(pts, fill=color, width=int(sw), joint='curve')
    # rounded line caps
    r = sw / 2
    for p in (pts[0], pts[-1]):
        d.ellipse([p[0] - r, p[1] - r, p[0] + r, p[1] + r], fill=color)
    return img


def master_icon(size=1024):
    icon = gradient_rounded_square(size)
    draw_check(icon)
    return icon.resize((size, size), Image.LANCZOS)


def round_icon(size):
    icon = gradient_rounded_square(size * SUPER, radius_ratio=0)  # full square first
    draw_check(icon)
    # circular mask
    mask = Image.new('L', icon.size, 0)
    d = ImageDraw.Draw(mask)
    d.ellipse([0, 0, icon.size[0] - 1, icon.size[1] - 1], fill=255)
    out = Image.new('RGBA', icon.size, (0, 0, 0, 0))
    out.paste(icon, (0, 0), mask)
    return out.resize((size, size), Image.LANCZOS)


def adaptive_foreground(size):
    """White check with transparent background (adaptive icon foreground layer)."""
    s = size * SUPER
    img = Image.new('RGBA', (s, s), (0, 0, 0, 0))
    # inner gradient disc for depth within the safe zone
    grad = gradient_rounded_square(s // 2, radius_ratio=0.5)
    img.paste(grad, (s // 4, s // 4), grad)
    draw_check(img, box_ratio=0.36, width_ratio=0.065)
    return img.resize((size, size), Image.LANCZOS)


def splash(size_wh, icon_ratio=0.26):
    w, h = size_wh
    img = Image.new('RGB', (w, h), SHELL)
    side = min(w, h)
    icon = master_icon(int(side * icon_ratio))
    img.paste(icon, ((w - icon.size[0]) // 2, (h - icon.size[1]) // 2), icon)
    return img


def write(img, path, fmt='PNG'):
    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path, fmt)
    print('  ✓', path.relative_to(ROOT))


def main():
    res = MOBILE / 'android' / 'app' / 'src' / 'main' / 'res'
    ios_assets = MOBILE / 'ios' / 'App' / 'App' / 'Assets.xcassets'

    densities = {'mdpi': 48, 'hdpi': 72, 'xhdpi': 96, 'xxhdpi': 144, 'xxxhdpi': 192}
    fg_sizes = {'mdpi': 108, 'hdpi': 162, 'xhdpi': 216, 'xxhdpi': 324, 'xxxhdpi': 432}

    print('Android launcher icons…')
    for d, px in densities.items():
        write(master_icon(px), res / f'mipmap-{d}' / 'ic_launcher.png')
        write(round_icon(px), res / f'mipmap-{d}' / 'ic_launcher_round.png')
        write(adaptive_foreground(fg_sizes[d]), res / f'mipmap-{d}' / 'ic_launcher_foreground.png')

    print('Android adaptive background color…')
    bg = res / 'values' / 'ic_launcher_background.xml'
    bg.write_text(
        "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n"
        "<resources>\n"
        "    <color name=\"ic_launcher_background\">#2A2660</color>\n"
        "</resources>\n"
    )
    print('  ✓', bg.relative_to(ROOT))

    print('Android splash screens…')
    splash_sizes = {
        'mdpi': (320, 480),
        'hdpi': (480, 800),
        'xhdpi': (720, 1280),
        'xxhdpi': (960, 1600),
        'xxxhdpi': (1280, 1920),
    }
    for d, (w, h) in splash_sizes.items():
        write(splash((w, h)), res / f'drawable-port-{d}' / 'splash.png')
        write(splash((h, w)), res / f'drawable-land-{d}' / 'splash.png')
    write(splash((320, 480)), res / 'drawable' / 'splash.png')

    print('iOS app icon…')
    write(master_icon(1024), ios_assets / 'AppIcon.appiconset' / 'AppIcon-512@2x.png')

    print('iOS splash…')
    for name in ('splash-2732x2732.png', 'splash-2732x2732-1.png', 'splash-2732x2732-2.png'):
        write(splash((2732, 2732)), ios_assets / 'Splash.imageset' / name)

    print('\nDone. Run `npx cap sync` if the assets were regenerated.')


if __name__ == '__main__':
    main()
