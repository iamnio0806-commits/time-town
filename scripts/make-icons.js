import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function crc32(buffer) {
  let crc = ~0;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return ~crc >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const name = Buffer.from(type);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([name, data])));
  return Buffer.concat([length, name, data, crc]);
}

function setPixel(pixels, size, x, y, color) {
  if (x < 0 || y < 0 || x >= size || y >= size) return;
  const index = (y * size + x) * 4;
  pixels[index] = color[0];
  pixels[index + 1] = color[1];
  pixels[index + 2] = color[2];
  pixels[index + 3] = color[3];
}

function fillRect(pixels, size, x, y, width, height, color) {
  for (let row = y; row < y + height; row += 1) {
    for (let col = x; col < x + width; col += 1) setPixel(pixels, size, col, row, color);
  }
}

function fillCircle(pixels, size, cx, cy, radius, color) {
  const r2 = radius * radius;
  for (let y = Math.floor(cy - radius); y <= Math.ceil(cy + radius); y += 1) {
    for (let x = Math.floor(cx - radius); x <= Math.ceil(cx + radius); x += 1) {
      const dx = x + 0.5 - cx;
      const dy = y + 0.5 - cy;
      if (dx * dx + dy * dy <= r2) setPixel(pixels, size, x, y, color);
    }
  }
}

function fillTriangle(pixels, size, points, color) {
  const [a, b, c] = points;
  const minY = Math.max(0, Math.floor(Math.min(a[1], b[1], c[1])));
  const maxY = Math.min(size - 1, Math.ceil(Math.max(a[1], b[1], c[1])));
  for (let y = minY; y <= maxY; y += 1) {
    const nodes = [];
    const edges = [[a, b], [b, c], [c, a]];
    for (const [p, q] of edges) {
      if ((p[1] <= y && q[1] > y) || (q[1] <= y && p[1] > y)) {
        nodes.push(p[0] + ((y - p[1]) * (q[0] - p[0])) / (q[1] - p[1]));
      }
    }
    nodes.sort((left, right) => left - right);
    if (nodes.length >= 2) {
      for (let x = Math.floor(nodes[0]); x <= Math.ceil(nodes[1]); x += 1) setPixel(pixels, size, x, y, color);
    }
  }
}

function draw(size) {
  const pixels = new Uint8Array(size * size * 4);
  const sky = [242, 181, 106, 255];
  const sun = [255, 241, 199, 255];
  const wall = [255, 249, 240, 255];
  const roof = [122, 46, 36, 255];
  const door = [27, 92, 56, 255];
  const windowColor = [246, 201, 138, 255];
  const road = [196, 160, 119, 255];
  fillRect(pixels, size, 0, 0, size, size, sky);
  fillCircle(pixels, size, size * 0.78, size * 0.22, size * 0.08, sun);
  fillRect(pixels, size, 0, Math.floor(size * 0.78), size, Math.ceil(size * 0.22), road);
  const left = size * 0.28;
  const right = size * 0.72;
  const top = size * 0.46;
  const bottom = size * 0.82;
  fillRect(pixels, size, left, top, right - left, bottom - top, wall);
  fillTriangle(pixels, size, [
    [size * 0.22, size * 0.48],
    [size * 0.5, size * 0.28],
    [size * 0.78, size * 0.48],
  ], roof);
  fillRect(pixels, size, size * 0.44, size * 0.58, size * 0.12, size * 0.24, door);
  fillRect(pixels, size, size * 0.33, size * 0.56, size * 0.08, size * 0.08, windowColor);
  fillRect(pixels, size, size * 0.59, size * 0.56, size * 0.08, size * 0.08, windowColor);
  return pixels;
}

function png(size, pixels) {
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y += 1) {
    raw[y * (size * 4 + 1)] = 0;
    Buffer.from(pixels.buffer, pixels.byteOffset + y * size * 4, size * 4)
      .copy(raw, y * (size * 4 + 1) + 1);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function scale(source, from, to) {
  const pixels = new Uint8Array(to * to * 4);
  const ratio = from / to;
  for (let y = 0; y < to; y += 1) {
    for (let x = 0; x < to; x += 1) {
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      let count = 0;
      const x0 = Math.floor(x * ratio);
      const x1 = Math.max(x0 + 1, Math.floor((x + 1) * ratio));
      const y0 = Math.floor(y * ratio);
      const y1 = Math.max(y0 + 1, Math.floor((y + 1) * ratio));
      for (let yy = y0; yy < y1; yy += 1) {
        for (let xx = x0; xx < x1; xx += 1) {
          const index = (yy * from + xx) * 4;
          r += source[index];
          g += source[index + 1];
          b += source[index + 2];
          a += source[index + 3];
          count += 1;
        }
      }
      const index = (y * to + x) * 4;
      pixels[index] = Math.round(r / count);
      pixels[index + 1] = Math.round(g / count);
      pixels[index + 2] = Math.round(b / count);
      pixels[index + 3] = Math.round(a / count);
    }
  }
  return pixels;
}

const large = draw(512);
const dir = path.join(root, "icons");
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, "icon-512.png"), png(512, large));
fs.writeFileSync(path.join(dir, "icon-192.png"), png(192, scale(large, 512, 192)));
fs.writeFileSync(path.join(dir, "icon-180.png"), png(180, scale(large, 512, 180)));
console.log("icons ready");
