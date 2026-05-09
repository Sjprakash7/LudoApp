import { motion } from 'framer-motion';
import clsx from 'clsx';
import { outerCellXY, SAFE_OUTER, START_AT, seatStroke, YARD } from './layout.js';

/** Teardrop “pin” token like reference UX */
function TokenPin({ tok, interactive, stroke, tid, onPick }) {
  const fill = stroke;
  return (
    <motion.button
      type="button"
      whileHover={{ scale: interactive ? 1.12 : 1 }}
      whileTap={{ scale: interactive ? 0.92 : 1 }}
      disabled={!interactive}
      onClick={() => interactive && onPick?.(tid)}
      className={clsx(
        'absolute z-30 -translate-x-1/2 -translate-y-[60%]',
        interactive && 'drop-shadow-[0_0_8px_rgba(255,255,255,.9)]'
      )}
      aria-label={`Token ${tid + 1}`}
    >
      <svg width="30" height="38" viewBox="0 0 30 38" fill="none" className="overflow-visible">
        <ellipse cx="15" cy="13" rx="12" ry="12" fill="white" stroke={fill} strokeWidth="2.2" />
        <path d="M8 21 C8 29 22 29 22 21 L26 37 H4 Z" fill={fill} stroke={stroke} strokeWidth="1" />
      </svg>
      <span className="pointer-events-none absolute left-1/2 top-2 -translate-x-1/2 text-[8px] font-black text-neutral-900/80">
        {tok.finished ? '★' : tok.yard ? '' : tok.home >= 0 ? '' : ''}
      </span>
    </motion.button>
  );
}

/** Home quadrant with white token wells */
function HomeBase({ accent }) {
  return (
    <div
      className="relative min-h-[58px] flex-1 overflow-hidden rounded-xl border-[3px] border-white/25 shadow-inner"
      style={{ backgroundColor: accent }}
    >
      <div className="absolute inset-[9%] grid grid-cols-2 grid-rows-2 gap-2 rounded-lg bg-black/30 p-[8%]">
        {[0, 1, 2, 3].map((n) => (
          <div
            key={n}
            className="rounded-full bg-white shadow-[inset_0_2px_4px_rgba(0,0,0,.12)] ring-2 ring-black/10"
          />
        ))}
      </div>
    </div>
  );
}

function PathStrip({ vertical }) {
  return (
    <div
      className={clsx(
        'relative flex-1 overflow-hidden rounded-xl border-[3px] border-slate-300/60 bg-[#fdfdfd]',
        vertical ? 'flex min-h-0 flex-col px-2 py-2' : 'min-h-[58px]'
      )}
    >
      <div
        className={clsx(
          vertical && 'flex h-full w-full flex-1 flex-col justify-between py-1',
          !vertical && 'flex h-full w-full flex-row justify-between px-2'
        )}
      >
        {vertical
          ? Array.from({ length: 11 }).map((_, i) => (
              <div key={i} className={clsx('min-h-[2px] flex-1 border-b border-black/10', i % 2 ? 'bg-white' : 'bg-[#f7f7f7]')} />
            ))
          : Array.from({ length: 11 }).map((_, i) => (
              <div key={i} className="flex flex-1 border-l border-black/15 first:border-0 bg-white/60" />
            ))}
      </div>
    </div>
  );
}

function CenterCastle() {
  return (
    <div className="relative flex min-h-[58px] flex-1 items-center justify-center overflow-hidden rounded-xl border-[3px] border-amber-200/85 bg-[#fff8e7] shadow-inner">
      <div
        className="aspect-square w-[94%] max-w-none rounded-xl border-[2px] border-white shadow-md"
        style={{
          background: `conic-gradient(
            #2E7D32 0deg 90deg,
            #FDD835 90deg 180deg,
            #1565C0 180deg 270deg,
            #C62828 270deg 360deg
          )`,
        }}
      />
    </div>
  );
}

/** Small star chips on safe squares (shown on SVG overlay) */
function SafeStarsOverlay({ size }) {
  return (
    <svg className="pointer-events-none absolute inset-2 z-[5] opacity-90" style={{ overflow: 'visible' }} viewBox="0 0 100 100">
      {[...SAFE_OUTER].map((idx) => {
        const p = outerCellXY(idx);
        return (
          <text key={idx} x={p.x} y={p.y + 1.8} fill="#b8860b" fontSize={size}>
            ★
          </text>
        );
      })}
    </svg>
  );
}

/** Start arrows near release cells */
function StartPins({ size }) {
  return (
    <svg className="pointer-events-none absolute inset-2 z-[4] opacity-70" viewBox="0 0 100 100">
      {START_AT.map((idx, s) => {
        const p = outerCellXY(idx);
        return (
          <text key={`s-${s}`} x={p.x - 5} y={p.y + 11} fill="white" fontSize={Math.max(6, size * 0.6)} fontWeight="700">
            S{s + 1}
          </text>
        );
      })}
    </svg>
  );
}

export function LudoBoard({ tokens = [], turnSeat, onPickToken, legalTokenIndices = [] }) {
  return (
    <div className="mx-auto w-full max-w-[min(96vw,440px)]">
      {/* Play with friends stripe — reference banner */}
      <div className="mb-3 text-center font-black italic tracking-wide text-transparent sm:mb-4">
        <span className="ludo-banner-text rounded-lg px-3 py-1 text-xl sm:text-2xl">
          PLAY WITH <span className="text-yellow-300">FRIENDS</span>
        </span>
      </div>

      <div
        className="ludo-cross-board relative aspect-square w-full rounded-2xl border-[3px] border-amber-200/65 p-[2.5%] shadow-[0_16px_50px_rgba(0,0,0,.45)] ring-4 ring-black/35"
      >
        <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(ellipse_at_center,rgba(33,150,243,.06),transparent)]" />

        {/* classic cross anatomy */}
        <div className="relative z-[1] flex aspect-square h-full w-full flex-col gap-[3.5px] rounded-xl bg-transparent">
          <div className="flex min-h-0 flex-[2] gap-[5px]">
            <HomeBase accent="#2E7D32" />
            <PathStrip vertical />
            <HomeBase accent="#FDD835" />
          </div>
          <div className="flex min-h-0 flex-[2] gap-[5px]">
            <PathStrip />
            <CenterCastle />
            <PathStrip />
          </div>
          <div className="flex min-h-0 flex-[2] gap-[5px]">
            <HomeBase accent="#C62828" />
            <PathStrip vertical />
            <HomeBase accent="#1565C0" />
          </div>
        </div>

        {/* ring track + safe stars */}
        <div className="pointer-events-none absolute inset-[8%] rounded-full border-2 border-dashed border-slate-400/50" />
        <SafeStarsOverlay size={4.2} />
        <StartPins size={5} />

        {/* token layer */}
        <div className="absolute inset-[6%] z-[20]">
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
                  <TokenPin
                    tok={tok}
                    tid={tid}
                    stroke={stroke}
                    interactive={interactive}
                    onPick={onPickToken}
                  />
                </div>
              );
            })
          )}
        </div>

        {/* subtle glossy corner highlights */}
        <div className="pointer-events-none absolute inset-2 rounded-xl bg-gradient-to-br from-white/[0.05] via-transparent to-black/35" />
      </div>
    </div>
  );
}
