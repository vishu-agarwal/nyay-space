export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="nyay-dashboard-shell flex min-h-full flex-1 flex-col">
      <div className="flex flex-1 flex-col px-4 py-5 sm:py-7 lg:py-8">
        {children}
      </div>
    </div>
  );
}
