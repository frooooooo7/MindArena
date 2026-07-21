export function BackgroundGradients() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 overflow-hidden"
    >
      <div className="absolute left-1/2 top-0 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-portal-violet/10 blur-[120px]" />
      <div className="portal-dot-grid absolute inset-0 opacity-20 [mask-image:linear-gradient(to_bottom,black,transparent_60%)]" />
    </div>
  );
}
