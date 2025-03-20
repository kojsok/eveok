import ItemPriceChecker from "@/components/ItemPriceChecker";
import { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://eveok.ru"), // Укажите ваш домен
  title: "EVEOK - Проверка цен предметов EVE Online | Текущие цены и анализ",
  description:
    "Проверьте текущие цены предметов в EVE Online. Получите актуальную информацию о стоимости товаров на рынке с возможностью анализа в разных регионах и категориях.",
  keywords: [
    "EVE Online price check",
    "проверка цен EVE Online",
    "цены предметов EVE Online",
    "анализ цен EVE Online",
    "текущие цены EVE Online",
    "EVEOK price",
    "цены на товары EVE Online",
    "рынок EVE Online",
    "цены на корабли EVE Online",
    "цены на модули EVE Online",
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
    "EVE Online market prices",
    "EVE Online buy orders",
    "EVE Online sell orders",
    "EVE Online trade tools",
    "инструменты для торговли EVE Online",
    "анализ спроса EVE Online",
    "анализ предложения EVE Online",
    "EVE Online price history",
    "история цен EVE Online",
    "EVE Online regional prices",
    "цены в регионах EVE Online",
    "цены в Jita EVE Online",
    "цены в Amarr EVE Online",
    "цены в Dodixie EVE Online",
    "цены в Rens EVE Online",
    "цены в Hek EVE Online",
    "EVE Online trading guide",
    "EVE Online market guide",
    "EVE Online economic analysis",
    "экономика EVE Online",
    "анализ экономики EVE Online",
    "статистика продаж EVE Online",
    "торговые стратегии EVE Online",
    "EVE Online market trends",
    "тренды рынка EVE Online",
    "EVE Online price comparison",
    "сравнение цен EVE Online",
    "EVE Online item pricing",
    "ценообразование предметов EVE Online",
    "EVE Online market tools",
    "инструменты для анализа рынка EVE Online",
  ],
  openGraph: {
    title: "EVEOK - Проверка цен предметов EVE Online | Текущие цены и анализ",
    description:
      "Проверьте текущие цены предметов в EVE Online. Получите актуальную информацию о стоимости товаров на рынке с возможностью анализа в разных регионах и категориях.",
    url: "https://eveok.ru/price", // Замените на реальный URL вашей страницы
    siteName: "EVEOK",
    locale: "ru_RU",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "EVEOK - Проверка цен предметов EVE Online | Текущие цены и анализ",
    description:
      "Проверьте текущие цены предметов в EVE Online. Получите актуальную информацию о стоимости товаров на рынке с возможностью анализа в разных регионах и категориях.",
    site: "@EVEOK", // Замените на ваш Twitter-аккаунт
    creator: "@EVEOK", // Замените на ваш Twitter-аккаунт
  },
  robots: "index, follow",
  alternates: {
    canonical: "https://eveok.ru/price", // Замените на реальный URL вашей страницы
  },
};

export default function Price() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      {/* Ограниченная ширина контейнера */}
      <div className="max-w-screen-xl w-full flex flex-col gap-6  pt-8 mx-auto">
        <ItemPriceChecker />
      </div>
    </div>
  );
}