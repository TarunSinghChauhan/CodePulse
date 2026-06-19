import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CodePulse — Watch Code Think",
  description:
    "Paste any code. Watch it come alive — line by line, variable by variable, with cinematic narration.",
  openGraph: {
    title: "CodePulse — Watch Code Think",
    description: "The first tool that makes code visible to the human eye.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
