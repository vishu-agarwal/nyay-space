export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="nyay-dashboard-shell flex min-h-full flex-1 flex-col">
      <div className="flex flex-1 flex-col pt-1.5 pb-3 nyay-page-x sm:pt-2 sm:pb-4 lg:pt-2 lg:pb-5">
        {children}
      </div>
    </div>
  );
}
