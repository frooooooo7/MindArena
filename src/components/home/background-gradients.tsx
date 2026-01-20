export function BackgroundGradients() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[600px] rounded-full bg-violet-500/15 blur-[120px] dark:bg-violet-500/10" />
      <div className="absolute top-1/3 left-1/4 h-[400px] w-[400px] rounded-full bg-indigo-500/10 blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 h-[350px] w-[350px] rounded-full bg-fuchsia-500/10 blur-[100px]" />
    </div>
  );
}
