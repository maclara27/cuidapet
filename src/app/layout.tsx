import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CuidaPet - Cuidado e Saúde Animal",
  description:
    "Aplicativo completo para tutores de pets: controle de vacinas, guia de nutrição e assistente inteligente de saúde pet.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CuidaPet",
  },
};

export const viewport: Viewport = {
  themeColor: "#1B7A56",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="bg-neutral-100 min-h-screen font-sans flex flex-col justify-start">
        {/* Mobile Wrapper container */}
        <div className="w-full max-w-md mx-auto min-h-screen bg-[#F8FAF9] shadow-2xl relative flex flex-col border-x border-emerald-900/5">
          {children}
        </div>
      </body>
    </html>
  );
}
