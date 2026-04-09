import type { Metadata, Viewport } from "next";
import { AuthProvider } from "@/features/auth/AuthProvider";
import { getSiteUrl } from "@/lib/siteUrl";
import "./globals.css";

const siteDescription =
  "Survival-first RPG — Black Market hub, void hunts, extraction. Play in browser or install as an app.";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: "Void Wars: Oblivion",
  description: siteDescription,
  applicationName: "Void Wars: Oblivion",
  formatDetection: {
    telephone: false,
  },
  appleWebApp: {
    capable: true,
    title: "Void Wars: Oblivion",
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Void Wars: Oblivion",
    title: "Void Wars: Oblivion",
    description: siteDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: "Void Wars: Oblivion",
    description: siteDescription,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
    { color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
