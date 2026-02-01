import type { Metadata } from "next";
import { Geist, Geist_Mono, Raleway } from "next/font/google";
import { MainLayout } from "@/components/layout/main-layout";
import { ThemeProvider } from "@/components/providers/theme-provider";
import "./globals.css";

const raleway = Raleway({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ABDU Academy - Online Course Platform",
  description: "Premium online courses for professional development and skill enhancement",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={raleway.variable}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <MainLayout>{children}</MainLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
