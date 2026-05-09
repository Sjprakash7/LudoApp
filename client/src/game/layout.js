/** Engine outer ring sync */
export const START_AT = [0, 13, 26, 39];
export const SAFE_OUTER = new Set([0, 8, 13, 21, 26, 34, 39, 47]);

/** Classic board visuals: TL green 1 · TR yellow 2 · BL red 0 · BR blue 3 */
export const SEAT_HEX = ['#C62828', '#2E7D32', '#FDD835', '#1565C0'];

/** Yard token anchor % inside square board — matches corner homes */
export const YARD = {
  0: { x: 24, y: 74 }, // Red bottom-left
  1: { x: 24, y: 26 }, // Green top-left
  2: { x: 76, y: 26 }, // Yellow top-right
  3: { x: 76, y: 74 }, // Blue bottom-right
};

export function seatStroke(seat) {
  return SEAT_HEX[seat % 4];
}

/** Map outer cell index — ring overlay for pawn positions (readable + smooth) */
export function outerCellXY(index) {
  const t = index / 52;
  const angle = t * Math.PI * 2 - Math.PI / 2;
  const r = 36;
  return {
    x: 50 + r * Math.cos(angle),
    y: 50 + r * Math.sin(angle),
  };
}

export function homeBaseXY(seat) {
  return YARD[seat];
}
