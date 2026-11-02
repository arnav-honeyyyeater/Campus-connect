import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import { MockStoreProvider } from "@/lib/mock-store/context";

export const metadata: Metadata = {
  title: "Campus Connect — Christ University Lavasa",
  description: "Mobile-first social web platform for students at Christ University Lavasa.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0C0F14",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className="antialiased min-h-screen">
        <MockStoreProvider>{children}</MockStoreProvider>
      </body>
    </html>
  );
}
