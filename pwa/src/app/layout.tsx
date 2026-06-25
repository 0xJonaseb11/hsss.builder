import type { Metadata, Viewport } from "next";
import { AppSerwistProvider } from "@/components/serwist-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "HSSS Builder",
  description: "HSSS builder ordering",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "HSSS",
  },
};

export const viewport: Viewport = {
  themeColor: "#003A70",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="min-h-screen antialiased">
        <AppSerwistProvider>{children}</AppSerwistProvider>
      </body>
    </html>
  );
}
