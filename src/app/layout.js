import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import PacmanCursor from "../components/ui/PacmanCursor";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Unscripted - AI-Powered Cinema Storytelling",
  description: "Transform your favorite movies into interactive storytelling experiences. Create alternate storylines with friends through AI-powered collaborative gameplay.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <PacmanCursor />
        {children}
      </body>
    </html>
  );
}