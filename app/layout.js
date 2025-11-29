import { Inter } from "next/font/google";
import "./globals.css"; // <--- THIS IS THE MAGIC LINE

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "TravelDebate AI",
  description: "Multi-Agent Orchestration",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}