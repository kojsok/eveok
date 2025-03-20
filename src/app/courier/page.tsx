import CourierContract from "@/components/CourierContract";
import { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://eveok.ru"), // Укажите ваш домен
  title: "EVEOK - Курьерские контракты EVE Online | Создание и управление доставками",
  description:
    "Создайте курьерский контракт на корпорацию EVE-OK для перевозки грузов между станциями. Удобный инструмент для организации безопасной доставки в EVE Online.",
  keywords: [
    "EVE Online courier contracts",
    "курьерские контракты EVE Online",
    "перевозка грузов EVE Online",
    "создание контрактов EVE Online",
    "EVEOK courier",
    "доставка грузов EVE Online",
    "организация перевозок EVE Online",
    "корпоративные контракты EVE Online",
    "контракты на доставку EVE Online",
    "станции погрузки EVE Online",
    "станции назначения EVE Online",
    "EVE Online logistics",
    "логистика EVE Online",
    "управление доставками EVE Online",
    "безопасная доставка EVE Online",
    "курьерская служба EVE Online",
    "грузоперевозки EVE Online",
    "как создать контракт EVE Online",
    "инструменты для логистики EVE Online",
    "EVE Online trade routes",
    "торговые маршруты EVE Online",
    "цены на доставку EVE Online",
    "рассчет стоимости доставки EVE Online",
    "контракты на транспорт EVE Online",
    "EVE Online freight service",
    "услуги перевозки EVE Online",
    "курьерские услуги EVE Online",
    "организация доставки EVE Online",
    "EVE Online cargo contracts",
    "контракты на перевозку EVE Online",
    "EVE Online shipping guide",
    "руководство по доставке EVE Online",
    "EVE Online delivery tools",
    "инструменты для доставки EVE Online",
    "EVE Online contract creation",
    "создание контрактов EVE Online",
    "EVE Online logistics guide",
    "руководство по логистике EVE Online",
    "EVE Online transport services",
    "услуги транспортировки EVE Online",
    "EVE Online delivery routes",
    "маршруты доставки EVE Online",
    "EVE Online cargo management",
    "управление грузами EVE Online",
    "EVE Online corporate contracts",
    "корпоративные контракты EVE Online",
    "EVE Online secure delivery",
    "безопасная доставка EVE Online",
  ],
  openGraph: {
    title: "EVEOK - Курьерские контракты EVE Online | Создание и управление доставками",
    description:
      "Создайте курьерский контракт на корпорацию EVE-OK для перевозки грузов между станциями. Удобный инструмент для организации безопасной доставки в EVE Online.",
    url: "https://eveok.ru/courier", // Замените на реальный URL вашей страницы
    siteName: "EVEOK",
    locale: "ru_RU",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "EVEOK - Курьерские контракты EVE Online | Создание и управление доставками",
    description:
      "Создайте курьерский контракт на корпорацию EVE-OK для перевозки грузов между станциями. Удобный инструмент для организации безопасной доставки в EVE Online.",
    site: "@EVEOK", // Замените на ваш Twitter-аккаунт
    creator: "@EVEOK", // Замените на ваш Twitter-аккаунт
  },
  robots: "index, follow",
  alternates: {
    canonical: "https://eveok.ru/courier", // Замените на реальный URL вашей страницы
  },
};

export default function Price() {
    return (
      <div className="flex flex-col min-h-screen bg-slate-950">
        {/* Ограниченная ширина контейнера */}
        <div className="max-w-screen-xl w-full flex flex-col gap-6  pt-8 mx-auto">
          <CourierContract />
        </div>
      </div>
    );
  }