/** Mirror server/constants for visualization */
export const START_AT = [0, 13, 26, 39];
export const SAFE_OUTER = new Set([0, 8, 13, 21, 26, 34, 39, 47]);

const COLORS = [
  'from-rose-500/90 to-orange-400/90',
  'from-emerald-400/90 to-lime-300/90',
  'from-amber-300/90 to-yellow-200/90',
  'from-sky-500/90 to-indigo-400/90',
];

export function seatGradientClass(seat) {
  return COLORS[seat % COLORS.length];
}

/** Map outer cell index to unit coordinates (0-100) on a circular ring */
export function outerCellXY(index) {
  const t = index / 52;
  const angle = t * Math.PI * 2 - Math.PI / 2;
  const r = 38;
  return {
    x: 50 + r * Math.cos(angle),
    y: 50 + r * Math.sin(angle),
  };
}

export const YARD = {
  0: { x: 22, y: 22 },
  1: { x: 78, y: 22 },
  2: { x: 78, y: 78 },
  3: { x: 22, y: 78 },
};

export function homeBaseXY(seat) {
  return YARD[seat];
}
