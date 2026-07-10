import { countryByName } from "@/lib/football";
import { FIFA_LOGO_RATIO } from "@/lib/fifaLogo";

export const CARD_W = 1080;
export const CARD_H = 1440;

const TEAL = "#43C1CD";
const PILL = "#2C8A94";
const EMOJI_FONT =
  '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';

export type CardData = {
  firstName: string;
  lastName: string;
  country: string;
  birth: string;
  height: string;
  weight: string;
  club: string;
};

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function drawPanini(ctx: CanvasRenderingContext2D, x: number, y: number) {
  const w = 156;
  const h = 60;
  ctx.save();
  // red frame
  ctx.fillStyle = "#E2001A";
  roundRect(ctx, x, y, w, h, 8);
  ctx.fill();
  // yellow inner
  ctx.fillStyle = "#FFCC00";
  roundRect(ctx, x + 6, y + 6, w - 12, h - 12, 5);
  ctx.fill();
  // wordmark
  ctx.fillStyle = "#0A2472";
  ctx.font = 'italic 900 30px Arial, sans-serif';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("PANINI", x + w / 2, y + h / 2 + 2);
  ctx.restore();
}

export type SubjectBox = { x: number; y: number; w: number; h: number };

// Find the tight bounding box of the non-transparent subject (the cut-out
// player) so different photos can be normalised to a consistent size.
export function computeSubjectBox(img: HTMLImageElement): SubjectBox | null {
  const cv = document.createElement("canvas");
  cv.width = img.width;
  cv.height = img.height;
  const ctx = cv.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(img, 0, 0);
  let data: Uint8ClampedArray;
  try {
    data = ctx.getImageData(0, 0, cv.width, cv.height).data;
  } catch {
    return null; // tainted (shouldn't happen — same-origin blob)
  }
  let minX = cv.width,
    minY = cv.height,
    maxX = 0,
    maxY = 0;
  let found = false;
  const alphaThreshold = 24;
  // sample every 2px for speed
  for (let y = 0; y < cv.height; y += 2) {
    for (let x = 0; x < cv.width; x += 2) {
      if (data[(y * cv.width + x) * 4 + 3] > alphaThreshold) {
        found = true;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (!found) return null;
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

function drawSubject(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  box: SubjectBox | null,
) {
  // Fall back to whole image if we couldn't isolate the subject.
  const b = box ?? { x: 0, y: 0, w: img.width, h: img.height };

  // Target: subject fills ~92% of the card height and no more than the card
  // width, anchored to the bottom centre.
  const targetH = CARD_H * 0.92;
  const maxW = CARD_W * 0.98;
  const scale = Math.min(targetH / b.h, maxW / b.w);

  const drawW = img.width * scale;
  const drawH = img.height * scale;
  const boxBottom = (b.y + b.h) * scale;
  const boxCenterX = (b.x + b.w / 2) * scale;

  // centre subject horizontally, sit its bottom at the card bottom
  const dx = CARD_W / 2 - boxCenterX;
  const dy = CARD_H - boxBottom;

  ctx.drawImage(img, dx, dy, drawW, drawH);
}

function fitFont(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  startPx: number,
  weight: string,
): number {
  let px = startPx;
  do {
    ctx.font = `${weight} ${px}px Arial, sans-serif`;
    if (ctx.measureText(text).width <= maxWidth) break;
    px -= 2;
  } while (px > 16);
  return px;
}

export function drawPlayerCard(
  ctx: CanvasRenderingContext2D,
  data: CardData,
  img: HTMLImageElement | null,
  subject: SubjectBox | null = null,
  logo: HTMLImageElement | null = null,
) {
  const c = countryByName(data.country);

  ctx.clearRect(0, 0, CARD_W, CARD_H);

  // rounded card + clip
  ctx.save();
  roundRect(ctx, 0, 0, CARD_W, CARD_H, 40);
  ctx.clip();

  // background
  ctx.fillStyle = TEAL;
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  // big "26" backdrop
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  ctx.font = '900 1000px "Arial Black", "Arial Bold", Arial, sans-serif';
  ctx.lineJoin = "round";
  ctx.lineWidth = 60; // stroke on top of fill to fatten the glyphs
  ctx.fillStyle = ctx.strokeStyle = c.c1;
  ctx.strokeText("2", -60, 700);
  ctx.fillText("2", -60, 700);
  ctx.fillStyle = ctx.strokeStyle = c.c2;
  ctx.strokeText("6", 300, 1180);
  ctx.fillText("6", 300, 1180);
  if (c.square) {
    ctx.fillStyle = c.square;
    ctx.fillRect(430, 470, 160, 160);
  }

  // official FIFA World Cup 26 emblem (top-right)
  if (logo) {
    const lw = 150;
    const lh = lw * FIFA_LOGO_RATIO;
    ctx.drawImage(logo, CARD_W - lw - 70, 70, lw, lh);
  }

  // player photo, size-normalised and anchored to the bottom
  if (img) {
    drawSubject(ctx, img, subject);
  }

  // vertical country code (right edge)
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "rgba(0,0,0,0.06)";
  ctx.lineWidth = 2;
  const letters = c.code.split("");
  const startY = 940;
  letters.forEach((ch, i) => {
    ctx.font = '900 104px "Arial Black", Arial, sans-serif';
    ctx.fillText(ch, 985, startY + i * 96);
  });
  ctx.restore();

  // flag badge
  const fx = 940;
  const fy = 820;
  const fr = 66;
  ctx.save();
  ctx.beginPath();
  ctx.arc(fx, fy, fr, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.save();
  ctx.beginPath();
  ctx.arc(fx, fy, fr - 6, 0, Math.PI * 2);
  ctx.clip();
  ctx.font = `${fr * 2.1}px ${EMOJI_FONT}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(c.flag, fx, fy + 2);
  ctx.restore();
  ctx.restore();

  // ---- bottom pills ----
  const pillX = 64;
  const pillW = 792;

  // name + stats pill
  ctx.fillStyle = PILL;
  roundRect(ctx, pillX, 1205, pillW, 150, 62);
  ctx.fill();

  const first = data.firstName.trim().toUpperCase();
  const last = data.lastName.trim().toUpperCase();
  const nameSpace = first && last ? " " : "";
  const fullName = `${first}${nameSpace}${last}`;
  const namePx = fitFont(ctx, fullName, pillW - 90, 62, "700");
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#ffffff";
  // draw first name (regular) + last name (bold) as one centred string
  ctx.font = `700 ${namePx}px Arial, sans-serif`;
  const boldW = ctx.measureText(last).width;
  ctx.font = `400 ${namePx}px Arial, sans-serif`;
  const firstW = ctx.measureText(first + nameSpace).width;
  const totalW = firstW + boldW;
  let cursor = pillX + pillW / 2 - totalW / 2;
  const nameY = 1258;
  ctx.textAlign = "left";
  ctx.font = `400 ${namePx}px Arial, sans-serif`;
  ctx.fillText(first + nameSpace, cursor, nameY);
  cursor += firstW;
  ctx.font = `700 ${namePx}px Arial, sans-serif`;
  ctx.fillText(last, cursor, nameY);

  // stats line
  const stats = [data.birth, data.height, data.weight]
    .map((s) => s.trim())
    .filter(Boolean)
    .join("  |  ");
  if (stats) {
    const statPx = fitFont(ctx, stats, pillW - 90, 40, "500");
    ctx.font = `500 ${statPx}px Arial, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(stats, pillX + pillW / 2, 1318);
  }

  // club pill
  const club = data.club.trim().toUpperCase();
  if (club) {
    const clubW = 660;
    const clubX = 64;
    ctx.fillStyle = PILL;
    roundRect(ctx, clubX, 1372, clubW, 60, 30);
    ctx.fill();
    const clubPx = fitFont(ctx, club, clubW - 60, 34, "700");
    ctx.font = `700 ${clubPx}px Arial, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(club, clubX + clubW / 2, 1403);
  }

  // Panini logo (bottom-right)
  drawPanini(ctx, CARD_W - 200, 1372);

  ctx.restore();
}
