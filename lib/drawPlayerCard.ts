import { countryByName } from "@/lib/football";

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

function drawTrophy(ctx: CanvasRenderingContext2D, cx: number, topY: number) {
  ctx.save();
  ctx.fillStyle = "#ffffff";
  // bowl / cup
  ctx.beginPath();
  ctx.moveTo(cx - 46, topY);
  ctx.bezierCurveTo(cx - 46, topY + 74, cx - 22, topY + 104, cx - 10, topY + 132);
  ctx.lineTo(cx + 10, topY + 132);
  ctx.bezierCurveTo(cx + 22, topY + 104, cx + 46, topY + 74, cx + 46, topY);
  ctx.closePath();
  ctx.fill();
  // stem + base
  ctx.fillRect(cx - 12, topY + 132, 24, 26);
  roundRect(ctx, cx - 40, topY + 158, 80, 20, 8);
  ctx.fill();
  // FIFA wordmark
  ctx.fillStyle = "#ffffff";
  ctx.font = '800 34px Arial, sans-serif';
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillText("FIFA", cx, topY + 214);
  ctx.restore();
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

function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const scale = Math.max(w / img.width, h / img.height);
  const dw = img.width * scale;
  const dh = img.height * scale;
  // centre horizontally, anchor to the bottom of the box
  const dx = x + (w - dw) / 2;
  const dy = y + h - dh;
  ctx.drawImage(img, dx, dy, dw, dh);
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
  ctx.font = '900 760px "Arial Black", Arial, sans-serif';
  ctx.fillStyle = c.c1;
  ctx.fillText("2", -10, 660);
  ctx.fillStyle = c.c2;
  ctx.fillText("6", 545, 660);

  // FIFA trophy (top-right)
  drawTrophy(ctx, 928, 96);

  // player photo, anchored to the bottom
  if (img) {
    drawCover(ctx, img, 70, 150, 940, CARD_H - 150);
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
