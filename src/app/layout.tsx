import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ShoreAgents Proposals",
  description: "ShoreAgents Proposals",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="robots" content="noindex, nofollow, noarchive, nocache, nosnippet, noimageindex, nocover, nocrawl" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
