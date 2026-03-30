type AuthCardProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

export function AuthCard({ title, description, children }: AuthCardProps) {
  return (
    <div className="nyay-card-shadow w-full max-w-md rounded-2xl border border-nyay-border/90 bg-nyay-surface/95 p-3 backdrop-blur-sm sm:p-8 lg:max-w-none dark:bg-[color-mix(in_srgb,var(--nyay-surface)_94%,transparent)]">
      <div className="mb-5 text-center lg:text-left">
        <h1 className="text-xl font-semibold tracking-tight text-nyay-trust dark:text-foreground">
          {title}
        </h1>
        {description ? (
          <p className="mt-1.5 text-sm text-nyay-muted">{description}</p>
        ) : null}
      </div>
      {children}
    </div>
  );
}
