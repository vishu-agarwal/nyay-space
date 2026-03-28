export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="nyay-dashboard-shell flex min-h-full flex-1 flex-col">
      <div className="flex flex-1 flex-col py-4 nyay-page-x sm:py-5 lg:py-6">
        {children}
      </div>
    </div>
  );
}
