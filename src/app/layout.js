import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ExitIntentHandler from "@/components/ExitIntentHandler";
import Header from "@/components/Header"; 
import Navbar from "@/components/Navbar"; 
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Curso Garimpo Urbano",
  description: "Recuperação de Metais Preciosos",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased scroll-smooth`}
    >
      <link rel="preconnect" href="https://www.youtube.com" />
      <link rel="preconnect" href="https://i.ytimg.com" />

      <body className="min-h-full flex flex-col bg-black text-white">
        <Header />
        <Navbar />
        {children}
        <Footer />
        <ExitIntentHandler />
      </body>
    </html>
  );
}
