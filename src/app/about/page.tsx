
import AboutPage from "@/components/AboutPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://eveok.ru"), // Укажите ваш домен
  title: "EVEOK - О проекте | Инструменты и утилиты для EVE Online",
  description:
    "Этот сайт создан для игроков EVE Online, предоставляя комплексные инструменты и утилиты для более эффективной игры. Узнайте о возможностях сайта, включая оценку лута, поиск на рынке, D-Scan анализ и базу кораблей.",
  keywords: [
    "EVE Online tools",
    "инструменты для EVE Online",
    "проект EVEOK",
    "о проекте EVEOK",
    "возможности EVEOK",
    "EVE Online utilities",
    "утилиты для EVE Online",
    "оценка лута EVE Online",
    "поиск на рынке EVE Online",
    "D-Scan анализ EVE Online",
    "база кораблей EVE Online",
    "информация о кораблях EVE Online",
    "характеристики кораблей EVE Online",
    "EVEOK корпорация",
    "корпорация EVE-OK",
    "помощь в EVE Online",
    "игровые инструменты EVE Online",
    "анализ тактики EVE Online",
    "EVE Online community",
    "сообщество EVE Online",
    "EVE Online guide",
    "руководство по EVE Online",
    "EVE Online data analysis",
    "анализ данных EVE Online",
    "EVE Online market search",
    "поиск товаров EVE Online",
    "лучшие цены EVE Online",
    "региональные цены EVE Online",
    "EVE Online loot evaluation",
    "оценка предметов EVE Online",
    "EVE Online ship database",
    "база данных кораблей EVE Online",
    "описание кораблей EVE Online",
    "справочник кораблей EVE Online",
    "EVE Online gameplay tools",
    "инструменты для геймплея EVE Online",
    "EVE Online strategy tools",
    "инструменты стратегии EVE Online",
    "EVE Online exploration tools",
    "инструменты исследования EVE Online",
    "EVE Online tactical analysis",
    "тактический анализ EVE Online",
    "EVE Online utility site",
    "сайт утилит EVE Online",
    "EVE Online player resources",
    "ресурсы для игроков EVE Online",
  ],
  openGraph: {
    title: "EVEOK - О проекте | Инструменты и утилиты для EVE Online",
    description:
      "Этот сайт создан для игроков EVE Online, предоставляя комплексные инструменты и утилиты для более эффективной игры. Узнайте о возможностях сайта, включая оценку лута, поиск на рынке, D-Scan анализ и базу кораблей.",
    url: "https://eveok.ru/about", // Замените на реальный URL вашей страницы
    siteName: "EVEOK",
    locale: "ru_RU",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "EVEOK - О проекте | Инструменты и утилиты для EVE Online",
    description:
      "Этот сайт создан для игроков EVE Online, предоставляя комплексные инструменты и утилиты для более эффективной игры. Узнайте о возможностях сайта, включая оценку лута, поиск на рынке, D-Scan анализ и базу кораблей.",
    site: "@EVEOK", // Замените на ваш Twitter-аккаунт
    creator: "@EVEOK", // Замените на ваш Twitter-аккаунт
  },
  robots: "index, follow",
  alternates: {
    canonical: "https://eveok.ru/about", // Замените на реальный URL вашей страницы
  },
};


export default function About() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      {/* Ограниченная ширина контейнера */}
      <div className="max-w-screen-xl w-full flex flex-col gap-6  pt-8 mx-auto">
        <AboutPage />
      </div>
    </div>
  );
}