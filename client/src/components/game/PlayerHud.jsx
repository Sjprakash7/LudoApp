import clsx from 'clsx';

/** Corner strip: avatar + display name + dice / turn sparkle */
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

  const name =
    player?.username || player?.userId?.slice?.(0, 8) || (player?.isBot ? `Bot` : `Waiting`);

  let line = `Seat ${Number(seatLabel) + 1}`;
  if (isActiveTurn) line = isViewerSeat ? '⚡ Your turn' : '⚡ Playing';
  if (!player) line = `Empty (${Number(seatLabel) + 1})`;

  return (
    <div
      className={clsx(
        'player-hud max-w-[min(46vw,200px)] min-w-[120px]',
        flip && 'ml-auto flex-row-reverse text-right',
        isActiveTurn && 'player-hud--active'
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
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
        <span className="truncate text-[11px] font-bold uppercase tracking-wide text-white drop-shadow">{name}</span>
        <span className="text-[9px] text-sky-200/80">{line}</span>
      </div>
      {showDiceSlot && (
        <div className={clsx('dice-mini', diceValue != null ? 'opacity-100' : 'opacity-40')}>{diceValue ?? '●'}</div>
      )}
    </div>
  );
}
