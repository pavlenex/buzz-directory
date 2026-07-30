import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Find your hive — Buzz public communities",
  description:
    "Discover the public communities building, researching, and making things happen on Buzz.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title: "Find your hive",
    description: "The living directory of public communities on Buzz.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Find your hive",
    description: "The living directory of public communities on Buzz.",
  },
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
