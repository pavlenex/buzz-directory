import type { Metadata } from "next";
import "./globals.css";

const configuredSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000/";
const siteUrl = configuredSiteUrl.endsWith("/")
  ? configuredSiteUrl
  : `${configuredSiteUrl}/`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Find your hive — Buzz public communities",
  description:
    "Discover the public communities building, researching, and making things happen on Buzz.",
  icons: {
    icon: "./favicon.svg",
    shortcut: "./favicon.svg",
  },
  openGraph: {
    title: "Find your hive",
    description: "The living directory of public communities on Buzz.",
    type: "website",
    images: [
      {
        url: "./og.png",
        width: 1731,
        height: 909,
        alt: "Find your hive — public communities on Buzz",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Find your hive",
    description: "The living directory of public communities on Buzz.",
    images: ["./og.png"],
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
