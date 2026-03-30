import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Nyay Space",
    template: "%s · Nyay Space",
  },
  description: `
  NyayHub is a modern legal case management and consultation platform—and the single source of truth for an advocate’s practice. It helps legal professionals efficiently manage clients, track cases, organize documents, and stay updated with important hearings and deadlines in one reliable system instead of scattered notes and files.

  The platform provides a structured and intuitive interface where advocates can maintain case timelines, store and access legal documents, and manage client interactions seamlessly. It also enables online consultation and appointment scheduling, making it easier for clients to connect and communicate.

  Built with a focus on clarity, productivity, and user experience, NyayHub transforms complex legal processes into a streamlined digital workflow. It empowers advocates to stay organized, improve efficiency, and deliver better legal support to their clients.
`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <main className="flex min-h-0 flex-1 flex-col">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
