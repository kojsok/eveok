
import MarketOrders from "@/components/MarketOrders";
import { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://eveok.ru"), // Укажите ваш домен
  title: "EVEOK - Поиск предмета в маркете EVE Online | Цены и анализ",
  description:
    "Введите название предмета, чтобы узнать его текущую цену на рынке EVE Online. Проверяйте стоимость в разных регионах и принимайте обоснованные решения для торговли и производства.",
  keywords: [
    "EVE Online market",
    "поиск предмета в маркете EVE Online",
    "цены EVE Online",
    "анализ рынка EVE Online",
    "торговля EVE Online",
    "цены на корабли EVE Online",
    "цены на модули EVE Online",
    "EVEOK market",
    "маркет EVE Online",
    "поиск цены в EVE Online",
    "региональные цены EVE Online",
    "EVE Online price check",
    "EVE Online trade tools",
    "инструменты для торговли EVE Online",
    "анализ стоимости предметов EVE Online",
    "рынок EVE Online",
    "цены на ресурсы EVE Online",
    "цены на топливо EVE Online",
    "цены на материалы EVE Online",
    "цены на артефакты EVE Online",
    "цены на импланты EVE Online",
    "цены на скиллы EVE Online",
    "цены на чертежи EVE Online",
    "цены на боеприпасы EVE Online",
    "цены на компоненты EVE Online",
    "цены на корабельные части EVE Online",
    "цены на POS EVE Online",
    "цены на цитадели EVE Online",
    "цены на инфраструктуру EVE Online",
    "цены на PLEX EVE Online",
    "цены на ISK EVE Online",
    "торговые инструменты EVE Online",
    "анализ спроса EVE Online",
    "анализ предложения EVE Online",
    "EVE Online buy orders",
    "EVE Online sell orders",
    "EVE Online market analysis",
    "рыночная статистика EVE Online",
    "статистика продаж EVE Online",
    "анализ экономики EVE Online",
    "экономика EVE Online",
    "EVE Online trading guide",
    "EVE Online market guide",
    "EVE Online price history",
    "история цен EVE Online",
    "EVE Online regional prices",
    "цены в регионах EVE Online",
    "цены в Jita EVE Online",
    "цены в Amarr EVE Online",
    "цены в Dodixie EVE Online",
    "цены в Rens EVE Online",
    "цены в Hek EVE Online",
  ],
  openGraph: {
    title: "EVEOK - Поиск предмета в маркете EVE Online | Цены и анализ",
    description:
      "Введите название предмета, чтобы узнать его текущую цену на рынке EVE Online. Проверяйте стоимость в разных регионах и принимайте обоснованные решения для торговли и производства.",
    url: "https://eveok.ru/market", // Замените на реальный URL вашей страницы
    siteName: "EVEOK",
    locale: "ru_RU",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "EVEOK - Поиск предмета в маркете EVE Online | Цены и анализ",
    description:
      "Введите название предмета, чтобы узнать его текущую цену на рынке EVE Online. Проверяйте стоимость в разных регионах и принимайте обоснованные решения для торговли и производства.",
    site: "@EVEOK", // Замените на ваш Twitter-аккаунт
    creator: "@EVEOK", // Замените на ваш Twitter-аккаунт
  },
  robots: "index, follow",
  alternates: {
    canonical: "https://eveok.ru/market", // Замените на реальный URL вашей страницы
  },
};

export default function Market() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      {/* Ограниченная ширина контейнера */}
      <div className="max-w-screen-xl w-full flex flex-col gap-6  pt-8 mx-auto">
        <MarketOrders />
      </div>
    </div>
  );
}