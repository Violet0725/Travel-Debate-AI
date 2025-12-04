import { Inter } from "next/font/google";
import "./globals.css"; 
import { ErrorBoundary } from "./components/ui";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "TravelDebate AI",
  description: "Multi-Agent Travel Planning with AI Debate",
  keywords: ["travel", "AI", "itinerary", "budget", "luxury", "planning"],
  authors: [{ name: "TravelDebate.ai" }],
  openGraph: {
    title: "TravelDebate AI",
    description: "Multi-Agent Travel Planning with AI Debate",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}