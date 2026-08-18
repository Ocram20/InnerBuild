import fs from 'fs';
import zlib from 'zlib';

function createCrcTable() {
  const cTable = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) {
        c = 0xedb88320 ^ (c >>> 1);
      } else {
        c = c >>> 1;
      }
    }
    cTable[n] = c;
  }
  return cTable;
}

const crcTable = createCrcTable();

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(8 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);
  const typeAndData = buf.subarray(4, 8 + len);
  const crcVal = crc32(typeAndData);
  buf.writeUInt32BE(crcVal, 8 + len);
  return buf;
}

function createPng(width, height, getPixel) {
  // getPixel(x, y) => [r, g, b, a]
  const rawRows = [];
  for (let y = 0; y < height; y++) {
    const row = Buffer.alloc(1 + width * 4);
    row[0] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixel(x, y);
      const offset = 1 + x * 4;
      row[offset] = r;
      row[offset + 1] = g;
      row[offset + 2] = b;
      row[offset + 3] = a;
    }
    rawRows.push(row);
  }
  const rawData = Buffer.concat(rawRows);
  const compressed = zlib.deflateSync(rawData);

  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth 8
  ihdrData[9] = 6; // color type 6 (RGBA)
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace

  const ihdrChunk = makeChunk('IHDR', ihdrData);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Generate 96x96 badge PNG of Leaf icon
const W = 96;
const H = 96;

// Distance to segment function for rendering crisp anti-aliased SVG leaf path on 96x96 grid
// Leaf path normalized coordinates [0..24] scale to 96
// Let's render a solid leaf icon shape with anti-aliasing
function isPointInLeaf(px, py) {
  // Center around (48, 48), scale 3.2 (so 24x24 -> 76.8x76.8 inside 96x96 box with padding)
  const scale = 3.2;
  const offsetX = (96 - 24 * scale) / 2; // 9.6
  const offsetY = (96 - 24 * scale) / 2; // 9.6

  const x = (px - offsetX) / scale;
  const y = (py - offsetY) / scale;

  if (x < 0 || x > 24 || y < 0 || y > 24) return 0;

  // Leaf main body test:
  // Main leaf body curve: from (11, 20) sweeping up to (19, 2), curved back to (11, 20)
  // Distance to leaf shape center
  // Parametric / geometric test for leaf shape:
  // A leaf is bounded between two bezier curves/arcs:
  // Left arc: from (11, 20) to (19, 2) curving through (5, 10)
  // Right arc: from (11, 20) to (19, 2) curving through (21, 10)
  // Stem: line from (2, 21) curving to (11, 15)

  // Stem distance check:
  // Stem curve: (2, 21) to (11, 16)
  const stemDx = x - (2 + (11 - 2) * ((y - 21) / (16 - 21)));
  if (y >= 15 && y <= 21.5) {
    const t = (y - 15) / (21 - 15);
    const stemX = 11 * (1 - t) + 2 * t - Math.sin(t * Math.PI) * 2;
    const distToStem = Math.abs(x - stemX);
    if (distToStem < 1.2) {
      const alpha = Math.min(1, Math.max(0, (1.2 - distToStem) * 1.5));
      if (alpha > 0) return alpha;
    }
  }

  // Main leaf body:
  // Tip at (19, 2), base at (11, 20)
  // Let's check distance to central axis (11,20) -> (19,2)
  const dx = 19 - 11;
  const dy = 2 - 20;
  const len = Math.hypot(dx, dy);
  const ux = dx / len;
  const uy = dy / len;
  const nx = -uy;
  const ny = ux;

  // Vector from (11, 20) to (x, y)
  const vx = x - 11;
  const vy = y - 20;

  const proj = vx * ux + vy * uy; // distance along axis [0..len]
  const perp = vx * nx + vy * ny; // perpendicular distance

  if (proj >= -0.5 && proj <= len + 0.5) {
    const t = Math.max(0, Math.min(1, proj / len));
    // Width profile of leaf: 0 at tip (t=1), 0 at base (t=0), max width ~5.5 at t=0.45
    const widthProfile = Math.sin(Math.pow(t, 0.7) * Math.PI) * 5.8;
    const dist = Math.abs(perp);
    if (dist < widthProfile) {
      const aa = Math.min(1, (widthProfile - dist) * 1.5);
      return aa;
    }
  }

  return 0;
}

const badgePng = createPng(W, H, (x, y) => {
  const alphaVal = isPointInLeaf(x, y);
  if (alphaVal > 0) {
    const a = Math.round(alphaVal * 255);
    return [255, 255, 255, a]; // White with smooth alpha transparency
  }
  return [0, 0, 0, 0]; // 100% Transparent background
});

fs.writeFileSync('c:/Users/Utente/Desktop/InnerBuild-2/public/badge-96x96.png', badgePng);
fs.writeFileSync('c:/Users/Utente/Desktop/InnerBuild-2/public/badge.png', badgePng);
console.log('Successfully created badge-96x96.png and badge.png (Transparent monochrome leaf icon for Android notification status bar)');
