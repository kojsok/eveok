"use client"
import { useEffect, useState } from "react";
import Image from "next/image";
import { LucideLogOut } from "lucide-react";

type User = {
  CharacterID: number;
  CharacterName: string;
  CorporationID: number;
  AllianceID: number | null;
  SecurityStatus?: number;
  Description: string;
  Title: string;
};

type Corporation = {
  name: string;
};

type Alliance = {
  name: string;
};

const decodeDescription = (input: string): string => {
  try {
    if (input.startsWith("u'") && input.endsWith("'")) {
      input = input.slice(2, -1);
    }
    return input.replace(/\\u([\dA-Fa-f]{4})/g, (_, code) =>
      String.fromCharCode(parseInt(code, 16))
    );
  } catch {
    return 'Ошибка декодирования';
  }
};

export default function UserInfo() {
  const [user, setUser] = useState<User | null>(null);
  const [corporation, setCorporation] = useState<Corporation | null>(null);
  const [alliance, setAlliance] = useState<Alliance | null>(null);

  useEffect(() => {
    fetch("/api/auth/user")
      .then((res) => res.json())
      .then((data) => {
        if (data.Description) {
          data.Description = decodeDescription(data.Description);
        }
        if (data.SecurityStatus === undefined) {
          data.SecurityStatus = 0;
        }
        setUser(data);
      })
      .catch(() => setUser(null));
  }, []);

  useEffect(() => {
    if (user?.CorporationID) {
      fetch(`https://esi.evetech.net/dev/corporations/${user.CorporationID}/`)
        .then(res => res.json())
        .then(data => setCorporation(data))
        .catch(err => console.error('Ошибка загрузки корпорации:', err));
    }

    if (user?.AllianceID) {
      fetch(`https://esi.evetech.net/dev/alliances/${user.AllianceID}/`)
        .then(res => res.json())
        .then(data => setAlliance(data))
        .catch(err => console.error('Ошибка загрузки альянса:', err));
    }
  }, [user]);

  if (!user) return <p className="text-red-500">Вы не авторизованы</p>;

  const portraitUrl = `https://images.evetech.net/characters/${user.CharacterID}/portrait?size=256`;
  const corporationLogo = user.CorporationID
    ? `https://images.evetech.net/corporations/${user.CorporationID}/logo?size=64`
    : '';
  const allianceLogo = user.AllianceID
    ? `https://images.evetech.net/alliances/${user.AllianceID}/logo?size=64`
    : '';

  return (
    <div className="bg-slate-800 p-4 rounded-lg shadow-lg max-w-screen-xl mx-auto w-full mt-4">
      <div className="flex flex-col items-center space-y-4 md:flex-row md:space-y-0 md:space-x-6">
        <div className="flex flex-col items-center">
          <Image
            src={portraitUrl}
            alt="Portrait"
            width={64}
            height={64}
            className="rounded-full border-2 border-slate-600"
            unoptimized
          />
        </div>

        <div className="flex-1 w-full space-y-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            {/* Левая часть - Имя персонажа */}
            <div className="flex items-center space-x-3">
              <h2 className="text-xl font-bold text-slate-200">
                {user.CharacterName}
              </h2>
            </div>

            {/* Центральная часть - Корпорация и Альянс */}
            <div className="flex flex-col md:flex-row items-center space-x-3">
              {user.CorporationID && (
                <>
                  <Image
                    src={corporationLogo}
                    alt="Corporation Logo"
                    width={32}
                    height={32}
                    className="rounded"
                    unoptimized
                  />
                  <div>
                    <p className="text-sm text-slate-400">Корпорация</p>
                    <p className="text-slate-200">{corporation?.name || 'N/A'}</p>
                  </div>
                </>
              )}
              {user.AllianceID && (
                <div className="flex items-center space-x-3">
                  <Image
                    src={allianceLogo}
                    alt="Alliance Logo"
                    width={32}
                    height={32}
                    className="rounded"
                    unoptimized
                  />
                  <div>
                    <p className="text-sm text-slate-400">Альянс</p>
                    <p className="text-slate-200">{alliance?.name || 'N/A'}</p>
                  </div>
                </div>
              )}
              {/* Статус */}
              <div>
                <p className="text-sm text-slate-400">Сек. статус</p>
                <p className="text-slate-200">
                  {user.SecurityStatus?.toFixed(2) || 'N/A'}
                </p>
              </div>
            </div>

            {/* Правая часть - Кнопка и статус */}
            <div className="flex flex-col md:flex-row items-center space-x-3 space-y-2 md:space-y-0">
              {/* Кнопка выхода */}
              <a
                href="/api/auth/logout"
                className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded text-white transition-colors flex items-center gap-2"
              >
                <LucideLogOut size={20} /> {/* Иконка */}
                Выйти
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

