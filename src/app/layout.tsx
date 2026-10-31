import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Campus Connect",
  description: "Christ University Lavasa community platform",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
