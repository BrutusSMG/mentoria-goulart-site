import { Geist } from "next/font/google";
import "./globals.css";
import ExitIntentHandler from "@/components/ExitIntentHandler";
import Header from "@/components/Header"; 
import Navbar from "@/components/Navbar"; 
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import FacebookPixel from "@/components/FacebookPixel";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL('https://www.mentoriagarimpourbano.com.br' ),
  title: {
    default: "Garimpo Urbano | Recuperação de Metais Preciosos",
    template: "%s | Garimpo Urbano" // Se você criar outras páginas, o Next.js adiciona o sufixo automaticamente
  },
  description: "Aprenda o passo a passo para extrair e refinar ouro, prata, platina e paládio de sucatas e resíduos. O portal completo para garimpeiros urbanos e ourives.",
  keywords: [
    "garimpo urbano", "refino de ouro", "recuperação de prata", 
    "metais preciosos", "ourivesaria", "extração de paládio", 
    "curso de refino", "José Goulart Filho"
  ],
  authors: [{ name: "José Goulart Filho" }],
  creator: "José Goulart Filho",
  
  // Configurações para WhatsApp, Facebook e LinkedIn
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://www.mentoriagarimpourbano.com.br",
    title: "Garimpo Urbano | Recuperação de Metais Preciosos",
    description: "Aprenda o passo a passo para extrair e refinar ouro, prata, platina e paládio de sucatas e resíduos.",
    siteName: "Garimpo Urbano",
    images: [
      {
        url: "/og-image.jpg", // A imagem que vai aparecer no WhatsApp (vamos falar dela abaixo )
        width: 1200,
        height: 630,
        alt: "Garimpo Urbano - Transforme Sucata em Riqueza",
      },
    ],
  },
  
  // Configurações para Twitter/X
  twitter: {
    card: "summary_large_image",
    title: "Garimpo Urbano | Recuperação de Metais Preciosos",
    description: "Aprenda o passo a passo para extrair e refinar ouro, prata, platina e paládio de sucatas e resíduos.",
    images: ["/og-image.jpg"],
  },
  
  // Instruções para o Google (Permite indexar tudo)
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} h-full antialiased scroll-smooth`}
      data-scroll-behavior="smooth"
    >
      <link rel="preconnect" href="https://www.youtube.com" />
      <link rel="preconnect" href="https://i.ytimg.com" />

      <body className="min-h-full flex flex-col bg-black text-white" suppressHydrationWarning>
        <FacebookPixel />
        <Header />
        <Navbar />
        {children}
        <Footer />
        <ExitIntentHandler />
        <WhatsAppButton />
      </body>
    </html>
  );
}
