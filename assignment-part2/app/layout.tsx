/*
Student Name: Vrishab Chetty
File: layout.tsx
Description: Root layout for the CabsOnline Part 2 Next.js application.
*/

import "./globals.css";

export const metadata = {
  title: "CabsOnline Part 2",
  description: "Modern taxi booking system built with Next.js and TypeScript",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}