import Dscan from "@/components/Dscan";

import { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://eveok.ru"), // Укажите ваш домен
  title: "EVEOK - D-Scan Parser | Быстрый анализ тактической ситуации в системе",
  description:
    "Используйте D-Scan Parser для быстрого анализа тактической ситуации в системе EVE Online. Получайте информацию о кораблях, структурах и других объектах в режиме реального времени.",
  keywords: [
    "EVE Online dscan",
    "dscan parser",
    "анализ dscan",
    "tactical situation EVE Online",
    "корабли в системе EVE Online",
    "структуры EVE Online",
    "EVEOK dscan",
    "dscan анализатор",
    "быстрый dscan",
    "dscan инструмент",
    "как использовать dscan",
    "dscan руководство",
    "EVE Online сканирование",
    "анализ кораблей EVE Online",
    "анализ POS в EVE Online",
    "анализ citadel в EVE Online",
    "анализ аномалий EVE Online",
    "анализ сигнатур EVE Online",
    "dscan для PvP",
    "dscan для PvE",
    "dscan для новичков",
    "dscan для промышленности",
    "EVE Online тактика",
    "анализ системы EVE Online",
    "dscan online tool",
    "dscan scanner",
    "dscan data analysis",
    "dscan ship detection",
    "EVE Online fleet analysis",
    "анализ флота EVE Online",
    "dscan для разведки",
    "dscan guide",
    "dscan tutorial",
    "EVE Online exploration tools",
    "инструменты для исследования EVE Online",
    "анализ боевой ситуации EVE Online",
    "анализ опасности в системе EVE Online",
    "dscan для торговли",
    "dscan для майнинга",
    "dscan для шпионажа",
    "анализ звездной системы EVE Online",
    "EVE Online security scan",
    "анализ безопасности EVE Online",
    "dscan для wormholes",
    "анализ червоточин EVE Online",
    "dscan для nullsec",
    "dscan для lowsec",
    "dscan для highsec",
    "анализ пилотов EVE Online",
    "EVE Online ship spotting",
    "dscan для стратегии",
    "анализ тактической информации EVE Online",
  ],
  openGraph: {
    title: "EVEOK - D-Scan Parser | Быстрый анализ тактической ситуации в системе",
    description:
      "Используйте D-Scan Parser для быстрого анализа тактической ситуации в системе EVE Online. Получайте информацию о кораблях, структурах и других объектах в режиме реального времени.",
    url: "https://eveok.ru/dscan", // Замените на реальный URL вашей страницы
    siteName: "EVEOK",
    locale: "ru_RU",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "EVEOK - D-Scan Parser | Быстрый анализ тактической ситуации в системе",
    description:
      "Используйте D-Scan Parser для быстрого анализа тактической ситуации в системе EVE Online. Получайте информацию о кораблях, структурах и других объектах в режиме реального времени.",
    site: "@EVEOK", // Замените на ваш Twitter-аккаунт
    creator: "@EVEOK", // Замените на ваш Twitter-аккаунт
  },
  robots: "index, follow",
  alternates: {
    canonical: "https://eveok.ru/dscan", // Замените на реальный URL вашей страницы
  },
};

export default function Price() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      {/* Ограниченная ширина контейнера */}
      <div className="max-w-screen-xl w-full flex flex-col gap-6  pt-8 mx-auto">
        <Dscan />
      </div>
    </div>
  );
}