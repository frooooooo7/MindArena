interface AuthCardProps {
  children: React.ReactNode;
}

export function AuthCard({ children }: AuthCardProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8 backdrop-blur-2xl shadow-2xl">
      {/* Ambient Top Glows */}
      <div className="pointer-events-none absolute -right-20 -top-20 size-60 rounded-full bg-portal-mint/15 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 -bottom-20 size-60 rounded-full bg-portal-violet/15 blur-3xl" />

      <div className="relative z-10">{children}</div>
    </div>
  );
}
