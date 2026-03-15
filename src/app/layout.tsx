import type { Metadata } from "next";
import { Playfair_Display, Libre_Franklin } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const libre = Libre_Franklin({
  subsets: ["latin"],
  variable: "--font-libre",
});

export const metadata: Metadata = {
  title: "3D Landing Page",
  description: "A stunning landing page with 3D models",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${libre.variable} font-sans`}>
        {children}
      </body>
    </html>
  );
}
