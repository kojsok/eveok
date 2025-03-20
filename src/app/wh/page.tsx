import Wh from "@/components/wh";
import WHSystems from "@/components/WHSystems";
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://eveok.ru"), // Укажите ваш домен
  title: "EVEOK - Wormhole (Червоточины) | Исследование EVE Online",
  description:
    "Полная информация о червоточинах (wormholes) в EVE Online. Изучайте их характеристики, классы, сигнатуры и безопасность. Удобный инструмент для исследования галактики New Eden.",
  keywords: [
    "EVE Online wormholes",
    "червоточины EVE Online",
    "wormhole classes",
    "классы червоточин",
    "сигнатуры червоточин",
    "исследование EVE Online",
    "New Eden wormholes",
    "статические червоточины",
    "EVEOK wormhole",
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

export default function Price() {
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