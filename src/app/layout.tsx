import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"
import Navigation from "@/components/Navigation";
import IntellectualPropertyNotice from "@/components/IntellectualPropertyNotice";
import Promo from "@/components/Promo";
import DonationPanel from "@/components/DonationPanel";
import GoogleAnalytics from "@/components/GoogleAnalytics";



const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// export const metadata: Metadata = {
//   title: "EVEOK - Утилиты для удобного исследования галактики в игре EVE Online.",
//   description: "Утилиты для удобного исследования галактики в игре EVE Online. Добро пожаловать в мир EVE Online, где каждое решение определяет твою судьбу.",
// };

export const metadata: Metadata = {
  metadataBase: new URL("https://eveok.ru"), // Укажите ваш домен
  // title: "EVEOK - Главная | Исследуй безграничную галактику EVE Online",
  title: {
    template: "%s | EVEOK",
    default: "EVEOK - Главная | Исследуй безграничную галактику EVE Online",
  },
  description:
    "Погрузись в мир EVE Online — исследуй безграничную галактику возможностей. Добро пожаловать в уникальную вселенную, где каждое решение определяет твою судьбу. Инструменты и утилиты для эффективного изучения EVE Online.",
  keywords: [
    "EVE Online",
    "мир EVE Online",
    "галактика EVE Online",
    "возможности EVE Online",
    "судьба в EVE Online",
    "решения в EVE Online",
    "исследование EVE Online",
    "инструменты EVE Online",
    "утилиты EVE Online",
    "EVEOK",
    "главная EVEOK",
    "EVE Online guide",
    "руководство по EVE Online",
    "вселенная EVE Online",
    "игровой процесс EVE Online",
    "геймплей EVE Online",
    "EVE Online community",
    "сообщество EVE Online",
    "игра EVE Online",
    "космическая стратегия EVE Online",
    "экономика EVE Online",
    "политика EVE Online",
    "войны EVE Online",
    "торговля EVE Online",
    "промышленность EVE Online",
    "добыча ресурсов EVE Online",
    "майнинг EVE Online",
    "PvP EVE Online",
    "PvE EVE Online",
    "исследования EVE Online",
    "червоточины EVE Online",
    "wormholes EVE Online",
    "корабли EVE Online",
    "структуры EVE Online",
    "POS EVE Online",
    "цитадели EVE Online",
    "флоты EVE Online",
    "альянсы EVE Online",
    "корпорации EVE Online",
    "EVE Online tools",
    "инструменты для EVE Online",
    "анализ тактики EVE Online",
    "тактика EVE Online",
    "стратегии EVE Online",
    "маркет EVE Online",
    "рынок EVE Online",
    "цены EVE Online",
    "анализ рынка EVE Online",
    "D-Scan анализ EVE Online",
    "оценка лута EVE Online",
    "поиск предметов EVE Online",
    "база кораблей EVE Online",
    "характеристики кораблей EVE Online",
    "справочник EVE Online",
    "ресурсы для игроков EVE Online",
    "начало игры EVE Online",
    "новички EVE Online",
    "опытные игроки EVE Online",
    "советы по игре EVE Online",
    "EVE Online universe",
    "EVE Online exploration",
    "EVE Online tactics",
    "EVE Online economy",
    "EVE Online alliances",
    "EVE Online corporations",
    "EVE Online ships",
    "EVE Online structures",
    "EVE Online mining",
    "EVE Online trading",
    "EVE Online industry",
    "EVE Online resources",
    "EVE Online missions",
    "EVE Online combat",
    "EVE Online fleets",
    "EVE Online wormhole mechanics",
    "EVE Online market analysis",
    "EVE Online price check",
    "EVE Online ship database",
    "EVE Online gameplay tips",
    "EVE Online beginner guide",
    "EVE Online advanced strategies",
    "EVE Online player tools",
    "EVE Online utility site",
    "EVE Online data tools",
    "EVE Online exploration tools",
    "EVE Online tactical analysis",
    "EVE Online strategic planning",
    "EVE Online decision-making",
    "EVE Online destiny",
    "EVE Online unlimited possibilities",
  ],
  openGraph: {
    title: "EVEOK - Главная | Исследуй безграничную галактику EVE Online",
    description:
      "Погрузись в мир EVE Online — исследуй безграничную галактику возможностей. Добро пожаловать в уникальную вселенную, где каждое решение определяет твою судьбу. Инструменты и утилиты для эффективного изучения EVE Online.",
    url: "https://eveok.ru/", // Замените на реальный URL вашей страницы
    siteName: "EVEOK",
    locale: "ru_RU",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "EVEOK - Главная | Исследуй безграничную галактику EVE Online",
    description:
      "Погрузись в мир EVE Online — исследуй безграничную галактику возможностей. Добро пожаловать в уникальную вселенную, где каждое решение определяет твою судьбу. Инструменты и утилиты для эффективного изучения EVE Online.",
    site: "", // Замените на ваш Twitter-аккаунт
    creator: "", // Замените на ваш Twitter-аккаунт
  },
  robots: "index, follow",
  alternates: {
    canonical: "https://eveok.ru/", // Замените на реальный URL вашей страницы
  },
};

export default function RootLayout({ children, }: Readonly<{ children: React.ReactNode; }>) {
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
              <DonationPanel />
              {/* Основной контент */}
              <div className="flex-1">{children}</div>

              {/* Футер */}
              <footer className="w-full flex justify-center items-center p-4">
                <div className="max-w-screen-xl w-full flex flex-col justify-center items-center gap-2">
                 

                  <Promo />
                  <IntellectualPropertyNotice />
                  <GoogleAnalytics />
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
