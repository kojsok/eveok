import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"
import Navigation from "@/components/Navigation";
import IntellectualPropertyNotice from "@/components/IntellectualPropertyNotice";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EVEOK - Утилиты для удобного исследования галактики в игре EVE Online.",
  description: "Утилиты для удобного исследования галактики в игре EVE Online. Добро пожаловать в мир EVE Online, где каждое решение определяет твою судьбу.",
};

export default function RootLayout({children,}: Readonly<{children: React.ReactNode;}>) {
  return (
    <>
      <html lang="en" suppressHydrationWarning>
        <head />
        {/* <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="flex flex-col min-h-screen bg-slate-950">
              <div className="flex items-center flex-col bg-slate-950">
              <Navigation />
              </div>
            
            {children}
            </div>
           
          </ThemeProvider>
        </body> */}

<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
  <ThemeProvider
    attribute="class"
    defaultTheme="system"
    enableSystem
    disableTransitionOnChange
  >
    <div className="flex flex-col min-h-screen bg-slate-950">
      {/* Контейнер для навигации */}
      <div className="flex items-center justify-between px-4 py-4 bg-slate-950">
        {/* Пустой блок слева для выравнивания справа */}
        {/* <div className="flex-1"></div> */}
        {/* Навигация справа на мобильных экранах */}
        <div className="ml-auto md:mx-auto">
          <Navigation />
        </div>
      </div>

      {/* Основной контент */}
      <div className="flex-1">{children}</div>

      {/* Футер */}
      <footer className="w-full flex justify-center items-center p-4">
        <div className="max-w-screen-xl w-full flex justify-center items-center gap-6">
        <IntellectualPropertyNotice />
          {/* <span>&copy; 2023 Your Company</span> */}
        </div>
      </footer>
    </div>
  </ThemeProvider>
</body>
      </html>
    </>
  )
}
