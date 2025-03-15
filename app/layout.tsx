import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./styles/globals.css";
import TopNav from "./ui/topnav";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | Backlog Tracker",
    default: "Backlog Tracker",
  },
  description: "My games tracker",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} antialiased`}>
        <div className="flex sticky top-0 z-50 bg-neutral-950 pb-4 md:pb-0">
          <TopNav />
        </div>
        {children}
      </body>
    </html>
  );
}
