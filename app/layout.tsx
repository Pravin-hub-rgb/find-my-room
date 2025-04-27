import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Toaster } from "sonner";
import 'leaflet/dist/leaflet.css';
import Footer from "@/components/Footer";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Find My Room",
  description: "Find affordable rooms for rent easily.",
  icons: {
    icon: "/logo5.ico", // if you added your logo in public/favicon.ico
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex min-h-screen flex-col`}
      >
        <Navbar />

        {/* Make main grow and push footer down */}
        <main className="flex-1">
          {children}
        </main>

        <Toaster richColors position="top-center" />
        <Footer />
      </body>
    </html>
  );
}
