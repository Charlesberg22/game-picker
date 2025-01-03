import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import TopNav from "./ui/topnav";

export const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: '%s | Backlog Tracker',
    default: 'Backlog Tracker',
  },
  description: "My games tracker",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} antialiased`}
      >
        <div className="flex md:flex-row md:overflow-hidden">
              <TopNav />
        </div>
        {children}
      </body>
    </html>
  );
}
