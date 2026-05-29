import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: "Particle — Where Form Meets Dimension",
  description: "An exploration of digital matter — particles that breathe, morph, and respond. Witness geometry in motion through scroll-based storytelling.",
  keywords: ["3D", "particles", "webgl", "three.js", "scroll storytelling", "digital art"],
  authors: [{ name: "Particle" }],
  openGraph: {
    title: "Particle — Where Form Meets Dimension",
    description: "An exploration of digital matter — particles that breathe, morph, and respond.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${cormorant.variable} ${dmSans.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
