import type { Metadata, Viewport } from "next";
import "./globals.css";

const configuredSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://buzzdir.xyz/";
const siteUrl = configuredSiteUrl.endsWith("/")
  ? configuredSiteUrl
  : `${configuredSiteUrl}/`;

/**
 * `output: "export"` means Next's `headers()` never runs and GitHub Pages
 * cannot set response headers, so the only place a policy can live is a meta
 * tag. `script-src`/`style-src` must allow inline because Next inlines its
 * bootstrap; what this actually buys is a hard block on third-party origins
 * (the site loads zero today) plus the base-uri / object-src / form-action
 * vectors. `frame-ancestors` is ignored in meta form — clickjacking can only
 * be closed by fronting Pages with something that sets real headers.
 *
 * Dev needs 'unsafe-eval' and blob: because React reconstructs callstacks with
 * eval() for its debugging features and Turbopack serves chunks from blobs.
 * Neither is emitted in the production build.
 */
const isDev = process.env.NODE_ENV !== "production";

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval' blob:" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  `connect-src 'self'${isDev ? " ws: wss:" : ""}`,
  `worker-src 'self'${isDev ? " blob:" : ""}`,
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
].join("; ");

const description =
  "An open-source, community-run directory of publicly shared Buzz communities.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "buzzdir — publicly shared Buzz communities",
  description,
  referrer: "strict-origin-when-cross-origin",
  alternates: { canonical: "./" },
  icons: { icon: "./favicon.svg", shortcut: "./favicon.svg" },
  openGraph: {
    title: "buzzdir",
    description,
    type: "website",
    url: "./",
    images: [
      {
        url: "./og.png",
        width: 1200,
        height: 630,
        alt: "buzzdir — publicly shared Buzz communities",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "buzzdir",
    description,
    images: ["./og.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#f7ff00",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta httpEquiv="Content-Security-Policy" content={contentSecurityPolicy} />
      </head>
      <body>{children}</body>
    </html>
  );
}
