#!/usr/bin/env python3
"""Render a ~17 s vertical (1080x1920) daily news video.
Usage: python3 daily_video.py input.json output.mp4
input.json: {"date": "Thu, Nov 19", "title": "3 things moving markets today",
             "items": [{"tag": "BITCOIN", "headline": "...", "detail": "..."}, x3],
             "closing": "Not investment advice."}
"""
import json, os, subprocess, sys, tempfile, textwrap
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import numpy as np

W, H, FPS = 1080, 1920, 30
HERE = os.path.dirname(os.path.abspath(__file__))
LOGO = os.path.join(HERE, '..', 'assets', 'logo.png')
FB = '/usr/share/fonts/truetype/google-fonts/Poppins-Bold.ttf'
FR = '/usr/share/fonts/truetype/google-fonts/Poppins-Regular.ttf'
if not os.path.exists(FR): FR = FB
def F(n, bold=True): return ImageFont.truetype(FB if bold else FR, n)
GREEN, GOLD, WHITE, PINK = (0, 255, 170), (255, 214, 0), (255, 255, 255), (255, 60, 140)

def bg():
    yy, xx = np.mgrid[0:H, 0:W]
    t = (xx / W * 0.4 + yy / H * 0.6)
    a, b = np.array([20, 60, 230]), np.array([140, 25, 200])
    arr = a + (b - a) * t[..., None]
    img = Image.fromarray(arr.astype('uint8'))
    d = ImageDraw.Draw(img)
    ov = Image.new('RGB', (W, H), (0, 0, 0)); od = ImageDraw.Draw(ov)
    for i in range(0, W, 90): od.line([(i, 0), (i, H)], fill=(255, 255, 255), width=2)
    img = Image.blend(img, Image.composite(ov, img, ov.convert('L')), 0.06)
    return img.filter(ImageFilter.GaussianBlur(0.5))

BG = None
def base():
    global BG
    if BG is None:
        BG = bg()
        if os.path.exists(LOGO):
            lg = Image.open(LOGO).convert('RGB').resize((150, 150))
            m = Image.new('L', (150, 150), 0); ImageDraw.Draw(m).ellipse([0, 0, 150, 150], fill=255)
            BG.paste(lg, (60, 70), m)
        d = ImageDraw.Draw(BG)
        d.text((230, 100), 'KRITO EDGA NEWS', font=F(46), fill=WHITE)
        d.text((230, 158), 'crypto & markets', font=F(32, False), fill=(220, 225, 255))
    return BG.copy()

def wrap(d, text, font, width):
    words, lines, cur = text.split(), [], ''
    for w in words:
        t = (cur + ' ' + w).strip()
        if d.textlength(t, font=font) <= width: cur = t
        else: lines.append(cur); cur = w
    if cur: lines.append(cur)
    return lines

def block(d, y, text, font, fill, width=920, gap=1.25):
    for ln in wrap(d, text, font, width):
        d.text((80, y), ln, font=font, fill=fill); y += int(font.size * gap)
    return y

def scene_intro(j):
    im = base(); d = ImageDraw.Draw(im)
    d.rounded_rectangle([80, 520, 520, 600], radius=40, fill=GOLD)
    d.text((110, 530), j.get('date', ''), font=F(44), fill=(30, 20, 60))
    block(d, 680, j.get('title', '3 things moving markets today'), F(104), WHITE, gap=1.15)
    d.text((80, 1500), 'Watch till the end ↓', font=F(44, False), fill=(230, 230, 255))
    return im

def scene_item(n, it):
    im = base(); d = ImageDraw.Draw(im)
    d.text((80, 470), f'{n}', font=F(220), fill=GREEN)
    d.rounded_rectangle([300, 560, 300 + 40 + int(d.textlength(it['tag'].upper(), font=F(44))), 640], radius=40, fill=PINK)
    d.text((320, 570), it['tag'].upper(), font=F(44), fill=WHITE)
    y = block(d, 800, it['headline'], F(78), WHITE, gap=1.18)
    block(d, y + 50, it.get('detail', ''), F(48, False), (225, 230, 255), gap=1.35)
    return im

def scene_outro(j):
    im = base(); d = ImageDraw.Draw(im)
    block(d, 620, 'Follow for daily updates', F(96), WHITE, gap=1.15)
    d.rounded_rectangle([80, 1000, 1000, 1110], radius=55, fill=GREEN)
    d.text((120, 1020), 'Telegram: @kritoedganews', font=F(58), fill=(20, 20, 50))
    block(d, 1250, j.get('closing', 'News only – not investment advice.'), F(44, False), (230, 230, 255))
    return im

def enc(png, dur, out):
    tmp = out + '.tmp.mp4'
    vf = f'format=yuv420p,loop=-1:1,trim=duration={dur},fade=t=in:st=0:d=0.35,fade=t=out:st={dur-0.35}:d=0.35'
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', str(FPS), '-i', png, '-vf', vf,
                    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p', '-r', str(FPS), tmp], check=True)
    os.replace(tmp, out)

def main(inp, out):
    j = json.load(open(inp))
    scenes = [(scene_intro(j), 2.8)] + [(scene_item(i + 1, it), 4.2) for i, it in enumerate(j['items'][:3])] + [(scene_outro(j), 3.2)]
    td = tempfile.mkdtemp(); parts = []
    for k, (im, dur) in enumerate(scenes):
        p = os.path.join(td, f's{k}.png'); im.save(p)
        v = os.path.join(td, f's{k}.mp4'); enc(p, dur, v); parts.append(v)
    lst = os.path.join(td, 'list.txt')
    open(lst, 'w').write(''.join(f"file '{p}'\n" for p in parts))
    # silent AAC track: Instagram is more reliable with an audio stream
    tmp = out + '.tmp.mp4'
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', lst,
                    '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo', '-shortest',
                    '-c:v', 'copy', '-c:a', 'aac', '-b:a', '64k', '-movflags', '+faststart', tmp], check=True)
    os.replace(tmp, out)
    scenes[1][0].save(out.replace('.mp4', '_preview.jpg'), quality=85)
    print('OK', out)

if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
