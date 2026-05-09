import clsx from 'clsx';

export function GlassCard({ className, children, ...props }) {
  return (
    <div
      className={clsx(
        'glass-panel rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
