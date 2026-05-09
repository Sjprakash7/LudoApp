import { motion } from 'framer-motion';
import clsx from 'clsx';
import { outerCellXY, SAFE_OUTER, START_AT, seatStroke, YARD } from './layout.js';

function TokenPin({ tok, interactive, stroke, tid, onPick }) {
  const ring = interactive ? 'ring-4 ring-white/80' : 'ring-2 ring-slate-950/60';
  return (
    <motion.button
      type="button"
      whileHover={{ scale: interactive ? 1.08 : 1 }}
      whileTap={{ scale: interactive ? 0.96 : 1 }}
      disabled={!interactive}
      onClick={() => interactive && onPick?.(tid)}
      className={clsx(
        'group relative flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/95 text-sm font-black text-slate-950 shadow-[0_12px_24px_rgba(0,0,0,.28)] transition',
        ring,
        interactive && 'cursor-pointer'
      )}
      aria-label={`Token ${tid + 1}`}
    >
      <span className="absolute inset-0 rounded-full bg-gradient-to-br from-white to-slate-200 opacity-90" />
      <span className="relative z-10 inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-white text-base text-slate-950">
        <span className="absolute inset-0 rounded-full" style={{ backgroundColor: stroke }} />
        <span className="relative z-20 text-[11px] font-black text-white">{tid + 1}</span>
      </span>
      {tok.finished && (
        <span className="absolute -right-1 -top-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-[10px] font-bold text-slate-950 shadow-md">
          ★
        </span>
      )}
    </motion.button>
  );
}

function HomeBase({ accent }) {
  return (
    <div
      className="relative min-h-[58px] flex-1 overflow-hidden rounded-3xl border-[4px] border-white/20 shadow-inner"
      style={{ background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.18), transparent 45%), ${accent}` }}
    >
      <div className="absolute inset-0 rounded-3xl bg-black/10" />
      <div className="absolute inset-[10%] grid grid-cols-2 grid-rows-2 gap-3 rounded-3xl bg-slate-950/60 p-3">
        {[0, 1, 2, 3].map((n) => (
          <div
            key={n}
            className="flex items-center justify-center rounded-full bg-slate-100/90 shadow-[inset_0_3px_8px_rgba(0,0,0,.18)]"
          >
            <span className="h-4 w-4 rounded-full bg-slate-950/70" />
          </div>
        ))}
      </div>
      <div className="absolute bottom-3 left-3 rounded-full border border-white/15 bg-black/30 px-2 py-1 text-[10px] uppercase tracking-[0.22em] text-white/80">
        Home
      </div>
    </div>
  );
}

function PathStrip({ vertical }) {
  return (
    <div
      className={clsx(
        'relative flex-1 overflow-hidden rounded-3xl border-[4px] border-slate-200/15 bg-gradient-to-br from-white/95 to-slate-100/90 shadow-[inset_0_0_18px_rgba(0,0,0,.18)]',
        vertical ? 'flex min-h-0 flex-col p-2' : 'min-h-[80px] p-2'
      )}
    >
      <div
        className={clsx(
          vertical ? 'grid h-full w-full grid-rows-11 gap-2' : 'grid h-full w-full grid-cols-11 gap-2'
        )}
      >
        {Array.from({ length: 11 }).map((_, i) => (
          <div
            key={i}
            className={clsx(
              'rounded-2xl border border-slate-300/30 bg-slate-50 shadow-[inset_0_1px_2px_rgba(15,23,42,.08)]',
              i === 5 && 'bg-slate-100/95 ring-1 ring-amber-300/20'
            )}
          >
            {i === 5 && (
              <span className="flex h-full w-full items-center justify-center text-[10px] font-black uppercase tracking-[0.3em] text-amber-700">
                ★
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function CenterCastle() {
  return (
    <div className="relative flex min-h-[80px] flex-1 items-center justify-center overflow-hidden rounded-[2rem] border-[4px] border-amber-300/50 bg-gradient-to-br from-slate-50 via-white to-slate-100 shadow-inner">
      <div className="absolute inset-0 rounded-[2rem] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.9),transparent_40%)]" />
      <div className="aspect-square w-[90%] max-w-none rounded-[1.35rem] border-[3px] border-slate-900/10 bg-gradient-to-br from-[#FCE4EC] via-[#FFFDE7] to-[#E3F2FD] shadow-lg">
        <div className="grid h-full grid-cols-2 grid-rows-2">
          {['#2E7D32', '#FDD835', '#C62828', '#1565C0'].map((color) => (
            <div key={color} className="relative flex items-center justify-center">
              <div className="h-10 w-10 rounded-full" style={{ backgroundColor: color, boxShadow: '0 0 30px rgba(0,0,0,0.12)' }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SafeStarsOverlay({ size }) {
  return (
    <svg className="pointer-events-none absolute inset-2 z-[5] opacity-90" style={{ overflow: 'visible' }} viewBox="0 0 100 100">
      {[...SAFE_OUTER].map((idx) => {
        const p = outerCellXY(idx);
        return (
          <text key={idx} x={p.x} y={p.y + 1.8} fill="#f59e0b" fontSize={size}>
            ★
          </text>
        );
      })}
    </svg>
  );
}

function StartPins({ size }) {
  return (
    <svg className="pointer-events-none absolute inset-2 z-[4] opacity-75" viewBox="0 0 100 100">
      {START_AT.map((idx, s) => {
        const p = outerCellXY(idx);
        return (
          <text key={`s-${s}`} x={p.x - 5} y={p.y + 10} fill="white" fontSize={Math.max(6, size * 0.7)} fontWeight="900">
            S{s + 1}
          </text>
        );
      })}
    </svg>
  );
}

export function LudoBoard({ tokens = [], turnSeat, onPickToken, legalTokenIndices = [] }) {
  return (
    <div className="mx-auto w-full max-w-[min(96vw,520px)]">
      <div className="mb-4 flex items-center justify-between rounded-3xl border border-slate-700/60 bg-slate-950/90 px-4 py-3 shadow-[0_18px_52px_rgba(0,0,0,.35)]">
        <span className="text-xs uppercase tracking-[0.35em] text-slate-400">Play with friends</span>
        <span className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-cyan-200">
          Realtime battle
        </span>
      </div>

      <div className="ludo-cross-board relative aspect-square w-full overflow-hidden rounded-[2.25rem] border-4 border-slate-800/80 bg-slate-950/95 p-4 shadow-[0_30px_70px_rgba(0,0,0,.45)] backdrop-blur-sm">
        <div className="absolute inset-0 rounded-[2.25rem] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_40%)]" />

        <div className="relative z-10 flex aspect-square h-full w-full flex-col gap-[6px] rounded-[1.75rem]">
          <div className="flex min-h-0 flex-[2] gap-[6px]">
            <HomeBase accent="#2E7D32" />
            <PathStrip vertical />
            <HomeBase accent="#FDD835" />
          </div>
          <div className="flex min-h-0 flex-[2] gap-[6px]">
            <PathStrip />
            <CenterCastle />
            <PathStrip />
          </div>
          <div className="flex min-h-0 flex-[2] gap-[6px]">
            <HomeBase accent="#C62828" />
            <PathStrip vertical />
            <HomeBase accent="#1565C0" />
          </div>
        </div>

        <div className="pointer-events-none absolute inset-[8%] rounded-full border-2 border-dashed border-slate-400/40" />
        <SafeStarsOverlay size={4.2} />
        <StartPins size={5} />

        <div className="absolute inset-[6%] z-20">
          {tokens.map((row, seat) =>
            row.map((tok, tid) => {
              const stroke = seatStroke(seat);
              let pos = YARD[seat];
              if (tok.finished) pos = { x: 50, y: 50 };
              else if (!tok.yard && tok.home >= 0 && tok.outer < 0) {
                pos = {
                  x: YARD[seat].x + (((tok.home * 17) % 24) / 50) * 26,
                  y: YARD[seat].y + (((tok.home * 21) % 24) / 50) * 26,
                };
              } else if (!tok.yard && tok.outer >= 0) {
                pos = outerCellXY(tok.outer);
              }

              const interactive = seat === turnSeat && legalTokenIndices.includes(tid);
              return (
                <div
                  key={`${seat}-${tid}`}
                  className="absolute z-20"
                  style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                >
                  <TokenPin tok={tok} tid={tid} stroke={stroke} interactive={interactive} onPick={onPickToken} />
                </div>
              );
            })
          )}
        </div>

        <div className="pointer-events-none absolute inset-2 rounded-[2.25rem] bg-gradient-to-br from-white/5 via-transparent to-black/30" />
      </div>
    </div>
  );
}
