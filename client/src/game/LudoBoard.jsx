import { motion } from 'framer-motion';
import clsx from 'clsx';
import { outerCellXY, SAFE_OUTER, START_AT, seatGradientClass, YARD } from './layout.js';

function TokenDot({ seat, tok, tid, onPick, interactive }) {
  const color = seatGradientClass(seat);
  let pos = YARD[seat];
  let label = 'Y';
  if (tok.finished) {
    pos = { x: 50, y: 50 };
    label = '★';
  } else if (!tok.yard && tok.home >= 0 && tok.outer < 0) {
    pos = {
      x: YARD[seat].x + (tok.home * 4) % 10,
      y: YARD[seat].y + (tok.home * 3) % 10,
    };
    label = `H${tok.home}`;
  } else if (!tok.yard && tok.outer >= 0) {
    pos = outerCellXY(tok.outer);
    label = String(tok.outer);
  }

  const active = interactive;
  return (
    <motion.button
      type="button"
      whileHover={{ scale: active ? 1.15 : 1 }}
      whileTap={{ scale: active ? 0.95 : 1 }}
      onClick={() => active && onPick?.(tid)}
      className={clsx(
        'absolute z-20 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br text-[10px] font-black text-slate-950 shadow-lg',
        color,
        active && 'ring-2 ring-cyan-300/80'
      )}
      style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
      title={`Seat ${seat} token ${tid}`}
    >
      <span className="pointer-events-none">{label}</span>
    </motion.button>
  );
}

export function LudoBoard({ tokens, turnSeat, onPickToken, legalTokenIndices = [] }) {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[min(90vw,520px)]">
      <div className="absolute inset-0 rounded-[32px] border border-white/10 bg-gradient-to-br from-slate-900/80 to-slate-950/90 shadow-[0_0_80px_rgba(0,245,255,0.08)]" />

      {/* outer ring guides */}
      <svg className="absolute inset-0 h-full w-full opacity-70" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(148,163,184,0.3)" strokeDasharray="2 3" />
        {[...SAFE_OUTER].map((idx) => {
          const p = outerCellXY(idx);
          return (
            <circle key={`safe-${idx}`} cx={p.x} cy={p.y} r="1.6" fill="rgba(34,211,238,0.35)" />
          );
        })}
        {START_AT.map((idx, s) => {
          const p = outerCellXY(idx);
          return (
            <text key={`start-${s}`} x={p.x} y={p.y - 3} fontSize="3" fill="rgba(244,244,255,0.65)">
              S{s}
            </text>
          );
        })}
      </svg>

      <div className="absolute inset-[11%] rounded-3xl border border-white/5 bg-gradient-to-br from-slate-900/80 to-slate-950/90" />

      <div className="absolute left-1/2 top-1/2 z-10 flex h-[24%] w-[24%] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-cyan-400/30 bg-gradient-to-br from-cyan-500/20 via-purple-500/10 to-fuchsia-500/25 text-lg font-black tracking-[0.4em] text-white/90 shadow-[0_0_80px_rgba(191,95,255,0.18)]">
        LUDO
      </div>

      {/* yard clusters */}
      {Object.entries(YARD).map(([seat, pos]) => (
        <div
          key={seat}
          className="absolute z-[11] h-[12%] w-[12%] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-white/5 backdrop-blur"
          style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
        />
      ))}

      {/* render tokens */}
      {tokens?.map((row, seat) =>
        row.map((tok, tid) => (
          <TokenDot
            key={`${seat}-${tid}`}
            seat={seat}
            tok={tok}
            tid={tid}
            interactive={seat === turnSeat && legalTokenIndices.includes(tid)}
            onPick={onPickToken}
          />
        ))
      )}
    </div>
  );
}
