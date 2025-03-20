import ShipsList from "@/components/ShipsList";
import CombinedShipsData from "@/data/CombinedShipsData.json";
import { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://eveok.ru"), // Укажите ваш домен
  title: "EVEOK - Список кораблей EVE Online | Полная база данных",
  description:
    "Полная информация о всех кораблях EVE Online. Изучайте характеристики, классы, роли и особенности каждого корабля. Удобный справочник для игроков EVE Online.",
  keywords: [
    "EVE Online ships",
    "корабли EVE Online",
    "список кораблей EVE Online",
    "база кораблей EVE Online",
    "характеристики кораблей EVE Online",
    "классы кораблей EVE Online",
    "роли кораблей EVE Online",
    "особенности кораблей EVE Online",
    "EVEOK shiplist",
    "справочник кораблей EVE Online",
    "типы кораблей EVE Online",
    "фрегаты EVE Online",
    "крейсеры EVE Online",
    "линкоры EVE Online",
    "эсминцы EVE Online",
    "штурмовые корабли EVE Online",
    "промышленные корабли EVE Online",
    "титаны EVE Online",
    "суперкапиталы EVE Online",
    "капитальные корабли EVE Online",
    "карго корабли EVE Online",
    "минеры EVE Online",
    "боевые корабли EVE Online",
    "PvP корабли EVE Online",
    "PvE корабли EVE Online",
    "исследовательские корабли EVE Online",
    "червоточины корабли EVE Online",
    "wormhole ships EVE Online",
    "EVE Online ship database",
    "база данных кораблей EVE Online",
    "описание кораблей EVE Online",
    "статистика кораблей EVE Online",
    "рейтинги кораблей EVE Online",
    "лучшие корабли EVE Online",
    "EVE Online ship guide",
    "руководство по кораблям EVE Online",
    "EVE Online ship roles",
    "роли кораблей EVE Online",
    "EVE Online ship classes",
    "классификация кораблей EVE Online",
    "EVE Online ship fitting",
    "подгонка кораблей EVE Online",
    "EVE Online ship analysis",
    "анализ кораблей EVE Online",
    "EVE Online ship comparison",
    "сравнение кораблей EVE Online",
    "EVE Online ship selection",
    "выбор кораблей EVE Online",
    "EVE Online ship tactics",
    "тактика кораблей EVE Online",
    "EVE Online ship strategy",
    "стратегия кораблей EVE Online",
    "EVE Online ship builds",
    "билды кораблей EVE Online",
    "EVE Online ship modules",
    "модули кораблей EVE Online",
    "EVE Online ship fittings",
    "подгонки кораблей EVE Online",
    "EVE Online ship skills",
    "скиллы для кораблей EVE Online",
    "EVE Online ship progression",
    "прогресс кораблей EVE Online",
    "EVE Online ship tiers",
    "типы кораблей EVE Online",
    "EVE Online ship stats",
    "статистика кораблей EVE Online",
    "EVE Online ship overview",
    "обзор кораблей EVE Online",
    "EVE Online ship details",
    "детали кораблей EVE Online",
    "EVE Online ship index",
    "индекс кораблей EVE Online",
    "EVE Online ship encyclopedia",
    "энциклопедия кораблей EVE Online",
  ],
  openGraph: {
    title: "EVEOK - Список кораблей EVE Online | Полная база данных",
    description:
      "Полная информация о всех кораблях EVE Online. Изучайте характеристики, классы, роли и особенности каждого корабля. Удобный справочник для игроков EVE Online.",
    url: "https://eveok.ru/shiplist", // Замените на реальный URL вашей страницы
    siteName: "EVEOK",
    locale: "ru_RU",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "EVEOK - Список кораблей EVE Online | Полная база данных",
    description:
      "Полная информация о всех кораблях EVE Online. Изучайте характеристики, классы, роли и особенности каждого корабля. Удобный справочник для игроков EVE Online.",
    site: "", // Замените на ваш Twitter-аккаунт
    creator: "", // Замените на ваш Twitter-аккаунт
  },
  robots: "index, follow",
  alternates: {
    canonical: "https://eveok.ru/shiplist", // Замените на реальный URL вашей страницы
  },
};

export default function ShipListPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      {/* Ограниченная ширина контейнера */}
      <div className="max-w-screen-xl w-full flex flex-col gap-6  pt-8 mx-auto">
        <ShipsList data={CombinedShipsData} />
      </div>
    </div>
  );
}
