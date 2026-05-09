import clsx from 'clsx';

export function PlayerHud({
  player,
  seatLabel,
  isActiveTurn,
  isViewerSeat,
  diceValue,
  showDiceSlot,
  position = 'tl',
}) {
  const flip = position === 'tr' || position === 'br';

  const name = player?.username || (player?.isBot ? `Bot` : `Waiting`);
  const status = player
    ? isActiveTurn
      ? isViewerSeat
        ? 'Your turn'
        : 'Playing'
      : 'Waiting'
    : `Open ${Number(seatLabel) + 1}`;

  return (
    <div
      className={clsx(
        'player-hud w-full max-w-full min-w-0 rounded-[1.75rem] border border-white/10 bg-slate-950/85 p-3 shadow-[0_16px_40px_rgba(0,0,0,.28)]',
        flip && 'ml-auto flex-row-reverse text-right',
        isActiveTurn && 'player-hud--active glow-border'
      )}
    >
      <div className="player-hud__avatar-shell">
        {player?.avatar ? (
          <img src={player.avatar} alt="" className="h-full w-full object-cover" draggable={false} />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-white/15 text-[10px] text-white/70">
            —
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 px-2">
        <span className="truncate text-[11px] font-bold uppercase tracking-wide text-white drop-shadow">{name}</span>
        <span className="text-[9px] text-sky-200/80">{status}</span>
      </div>
      {showDiceSlot && (
        <div className={clsx('dice-mini', diceValue != null ? 'opacity-100' : 'opacity-40')}>{diceValue ?? '●'}</div>
      )}
    </div>
  );
}
