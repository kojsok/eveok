import Wh from "@/components/wh";
import WHSystems from "@/components/WHSystems";
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://eveok.ru"), // Укажите ваш домен
  title: "EVEOK - Wormhole (Червоточины) | Исследование EVE Online",
  description:
    "Полная информация о червоточинах (wormholes) в EVE Online. Изучайте их характеристики, классы, сигнатуры и безопасность. Удобный инструмент для исследования галактики New Eden.",
    keywords: [
      "eveok wh",
      "whdb",
      "eve whdb",
      "EVE Online wormholes",
      "червоточины EVE Online",
      "wormhole classes",
      "классы червоточин",
      "сигнатуры червоточин",
      "исследование EVE Online",
      "New Eden wormholes",
      "статические червоточины",
      "EVEOK wormhole",
      "wormhole mechanics",
      "механика червоточин",
      "wormhole exploration",
      "исследование червоточин",
      "wormhole mapping",
      "картирование червоточин",
      "wormhole anomalies",
      "аномалии червоточин",
      "wormhole connections",
      "соединения червоточин",
      "wormhole life cycle",
      "цикл жизни червоточин",
      "wormhole mass limits",
      "ограничения массы червоточин",
      "wormhole stability",
      "стабильность червоточин",
      "wormhole identification",
      "идентификация червоточин",
      "wormhole signatures",
      "подписи червоточин",
      "wormhole hunting",
      "охота на червоточины",
      "wormhole mining",
      "добыча ресурсов в червоточинах",
      "wormhole PvP",
      "PvP в червоточинах",
      "wormhole PvE",
      "PvE в червоточинах",
      "wormhole combat",
      "бои в червоточинах",
      "wormhole fleets",
      "флоты в червоточинах",
      "wormhole colonization",
      "колонизация червоточин",
      "wormhole resource extraction",
      "извлечение ресурсов из червоточин",
      "wormhole sleeper sites",
      "сайты спящих в червоточинах",
      "wormhole gas sites",
      "газовые сайты в червоточинах",
      "wormhole ore sites",
      "рудные сайты в червоточинах",
      "wormhole data sites",
      "информационные сайты в червоточинах",
      "wormhole relic sites",
      "артефактные сайты в червоточинах",
      "wormhole navigation",
      "навигация по червоточинам",
      "wormhole safety",
      "безопасность червоточин",
      "wormhole dangers",
      "опасности червоточин",
      "wormhole survival",
      "выживание в червоточинах",
      "wormhole tactics",
      "тактика в червоточинах",
      "wormhole strategies",
      "стратегии в червоточинах",
      "wormhole trade routes",
      "торговые маршруты через червоточины",
      "wormhole shortcuts",
      "ярлыки через червоточины",
      "wormhole discovery",
      "открытие червоточин",
      "wormhole research",
      "исследования червоточин",
      "wormhole lore",
      "история червоточин",
      "wormhole secrets",
      "секреты червоточин",
      "wormhole mysteries",
      "загадки червоточин",
      "wormhole adventures",
      "приключения в червоточинах",
      "wormhole exploration tools",
      "инструменты для исследования червоточин",
      "wormhole scanning",
      "сканирование червоточин",
      "wormhole probing",
      "зондирование червоточин",
      "wormhole anomalies guide",
      "руководство по аномалиям червоточин",
      "wormhole class system",
      "система классов червоточин",
      "wormhole statics",
      "статики червоточин",
      "wormhole dynamics",
      "динамика червоточин",
      "wormhole collapse",
      "коллапс червоточин",
      "wormhole collapse prevention",
      "предотвращение коллапса червоточин",
    ],
  openGraph: {
    title: "EVEOK - Wormhole (Червоточины) | Исследование EVE Online",
    description:
      "Полная информация о червоточинах (wormholes) в EVE Online. Изучайте их характеристики, классы, сигнатуры и безопасность. Удобный инструмент для исследования галактики New Eden.",
    url: "https://eveok.ru/wh", // Замените на реальный URL вашего сайта
    siteName: "EVEOK",
    images: [
      {
        url: "/wh/wormhole.jpg", // Замените на реальный путь к изображению
        width: 1200,
        height: 630,
        alt: "Червоточины EVE Online - исследуйте неизведанное!",
      },
    ],
    locale: "ru_RU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "EVEOK - Wormhole (Червоточины) | Исследование EVE Online",
    description:
      "Полная информация о червоточинах (wormholes) в EVE Online. Изучайте их характеристики, классы, сигнатуры и безопасность. Удобный инструмент для исследования галактики New Eden.",
    site: "", // Замените на ваш Twitter-аккаунт @EVEOK
    creator: "", // Замените на ваш Twitter-аккаунт @EVEOK
    images: [
      {
        url: "/wh/wormhole.jpg", // Замените на реальный путь к изображению
        width: 1200,
        height: 630,
        alt: "Червоточины EVE Online - исследуйте неизведанное!",
      },
    ],
  },
  robots: "index, follow",
  alternates: {
    canonical: "https://eveok.ru/wh", // Замените на реальный URL вашего сайта
  },
};

export default function WormholePage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      {/* Ограниченная ширина контейнера */}
      <div className="max-w-screen-xl w-full flex flex-col gap-6  pt-8 mx-auto">
        <WHSystems />
        
        {/* <p className="text-2xl font-bold mb-4 text-slate-300 items-center justify-center">Страница временно не доступна и находится в разработке</p> */}
        <Wh />
      </div>
    </div>
  );
}