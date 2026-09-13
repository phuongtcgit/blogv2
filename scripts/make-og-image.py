#!/usr/bin/env python3
"""Sinh ảnh OG mặc định 1200x630 (public/og-default.png).

Chạy lại khi muốn đổi: python3 scripts/make-og-image.py
Có thể sửa tên blog/màu ngay trong file này — hoặc thay hẳn ảnh bằng
file PNG tự thiết kế cùng tên.
"""
from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 630

BG = (22, 22, 24)        # #161618 — trùng nền dark mode của blog
FG = (232, 232, 230)     # #e8e8e6
ACCENT = (110, 168, 255) # #6ea8ff — màu accent dark mode
SOFT = (163, 163, 160)   # #a3a3a0

BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
REG = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"

# ✏️ CẦN ĐIỀN nếu muốn: dòng chữ trên ảnh mặc định
TITLE = "Blog của tôi"
SUBTITLE = "Suy nghĩ, ghi chép và những điều học được"

img = Image.new("RGB", (W, H), BG)
d = ImageDraw.Draw(img)

# Viền khung mảnh + thanh accent bên trái, phong cách tối giản như blog
d.rectangle([40, 40, W - 40, H - 40], outline=(44, 44, 46), width=2)
d.rectangle([100, 250, 108, 380], fill=ACCENT)

f_title = ImageFont.truetype(BOLD, 72)
f_sub = ImageFont.truetype(REG, 30)

d.text((140, 255), TITLE, font=f_title, fill=FG)
d.text((142, 360), SUBTITLE, font=f_sub, fill=SOFT)

img.save("public/og-default.png", "PNG", optimize=True)
print("saved public/og-default.png")
