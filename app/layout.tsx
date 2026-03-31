import type { Metadata, Viewport } from "next";
import { AuthProvider } from "@/features/auth/AuthProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Void Wars: Oblivion",
  description:
    "Survival-first RPG — Black Market hub, void hunts, extraction. Play in browser or install as an app.",
  applicationName: "Void Wars: Oblivion",
  formatDetection: {
    telephone: false,
  },
  appleWebApp: {
    capable: true,
    title: "Void Wars: Oblivion",
    statusBarStyle: "black-translucent",
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
