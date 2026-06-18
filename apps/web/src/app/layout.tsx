import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { APP_NAME, APP_TAGLINE } from "@huanqi/shared";
import { AppChrome } from "@/components/app-chrome";
import { NativeShell } from "@/components/native-shell";
import { ServerUrlBootstrap } from "@/components/server-url-bootstrap";
import "@/styles/shell-tokens.css";
import "@/styles/app-shell.css";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_TAGLINE,
  icons: {
    icon: [{ url: "/favicon.png", type: "image/png" }],
    apple: [{ url: "/apple-touch-icon.png", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: APP_NAME,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#44403c",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`app-web-shell ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-full">
        <NativeShell />
        <ServerUrlBootstrap />
        <AppChrome>{children}</AppChrome>
      </body>
    </html>
  );
}
