import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { Navigation } from "@/components/navigation";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Mnemonic — AI Memory Infrastructure",
  description:
    "Persistent memory for Claude Desktop. Upload documents, archive conversations, retrieve knowledge with semantic search and citations.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={cn(geistMono.variable, instrumentSerif.variable, "font-sans", geist.variable)}
    >
      <body className="font-sans antialiased">
        <Navigation />
        <main className="pt-14">{children}</main>
      </body>
    </html>
  );
}
