import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ToastProvider from "@/components/toast-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Semente Livre",
  description: "Plataforma de sementes crioulas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${inter.className} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}
