import React, { useEffect, useState, useCallback, useReducer, useMemo, useRef } from 'react';
import axios, { CancelTokenSource } from 'axios';
import Image from "next/image";
import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight } from 'lucide-react';

// Типы данных
interface ZKillboardData {
  killmail_id: number;
  zkb: {
    hash: string;
  };
}

interface KillmailDetails {
  killmail_id: number;
  killmail_time: string;
  solar_system_id: number;
  victim: {
    corporation_id: number;
    alliance_id?: number;
    ship_type_id: number;
  };
  attackers: Array<{
    corporation_id: number;
    alliance_id?: number;
    weapon_type_id?: number;
    final_blow: boolean;
    ship_type_id?: number;
  }>;
}

// Типы для кэша с TTL
interface CacheItem<T> {
  data: T;
  timestamp: number;
}

interface ShipData {
  name: string;
}

interface CorporationData {
  name: string;
  logo: string;
}

interface AllianceData {
  name: string;
}

interface PreparedKill {
  killmail_id: number;
  killmail_time: string;
  victim: {
    corporation_name: string;
    corporation_logo: string;
    corporation_id: number;
    alliance_name?: string;
    ship_name: string;
    ship_type_id: number;
  };
  attackers: Array<{
    corporation_name: string;
    corporation_logo: string;
    corporation_id: number;
    alliance_name?: string;
    ship_name?: string;
    ship_type_id?: number;
  }>;
  finalBlowAttacker?: {
    corporation_name: string;
    corporation_logo: string;
    corporation_id: number;
    alliance_name?: string;
    ship_name?: string;
    ship_type_id?: number;
  };
}

interface EnhancedCacheState {
  ships: Record<number, CacheItem<ShipData>>;
  corporations: Record<number, CacheItem<CorporationData>>;
  alliances: Record<number, CacheItem<AllianceData>>;
}

type CacheAction =
  | { type: 'ships'; payload: Record<number, CacheItem<ShipData>> }
  | { type: 'corporations'; payload: Record<number, CacheItem<CorporationData>> }
  | { type: 'alliances'; payload: Record<number, CacheItem<AllianceData>> };

// Константы
const MAX_KILLS_TO_PROCESS = 20;
const CACHE_TTL = 60 * 60 * 1000; // 1 час
const REQUEST_TIMEOUT = 1000; // 8 секунд
const initialState: EnhancedCacheState = {
  ships: {},
  corporations: {},
  alliances: {},
};

// Редюсер для кэша
function cacheReducer(state: EnhancedCacheState, action: CacheAction): EnhancedCacheState {
  return {
    ...state,
    [action.type]: { ...state[action.type], ...action.payload },
  };
}

const KilledShips: React.FC<{ solarSystemID: number }> = ({ solarSystemID }) => {
  const [kills, setKills] = useState<ZKillboardData[]>([]);
  const [preparedKills, setPreparedKills] = useState<PreparedKill[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState(0);
  const [cache, dispatch] = useReducer(cacheReducer, initialState);
  const cancelTokenSources = useRef<CancelTokenSource[]>([]);

  const itemsPerPage = 10;

  // Проверка валидности кэша
  const isCacheValid = useCallback(<T,>(cacheItem: CacheItem<T> | undefined): boolean => {
    return cacheItem !== undefined && Date.now() - cacheItem.timestamp < CACHE_TTL;
  }, []);

  // Утилиты для работы с запросами
  const createCancelToken = useCallback(() => {
    const source = axios.CancelToken.source();
    cancelTokenSources.current.push(source);
    return source.token;
  }, []);

  const cancelAllRequests = useCallback(() => {
    cancelTokenSources.current.forEach(source => source.cancel('Request canceled'));
    cancelTokenSources.current = [];
  }, []);

  // Улучшенная функция запроса с повторами
  const fetchWithRetry = useCallback(async <T extends object>(
    url: string,
    retries = 1,
    delay = 1000
  ): Promise<T | null> => {
    if (retries === 1) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    const cancelToken = createCancelToken();
    
    try {
      const response = await axios.get<T>(url, {
        timeout: REQUEST_TIMEOUT,
        cancelToken,
        validateStatus: (status) => status < 500
      });
      
      cancelTokenSources.current = cancelTokenSources.current.filter(
        src => src.token !== cancelToken
      );
      
      return response.data;
    } catch (err) {
      cancelTokenSources.current = cancelTokenSources.current.filter(
        src => src.token !== cancelToken
      );
      
      if (axios.isCancel(err)) {
        return null;
      }
      
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchWithRetry<T>(url, retries - 1, delay * 2);
      }
      
      return null;
    }
  }, [createCancelToken]);

  // Пакетная загрузка данных
  const fetchMultipleData = useCallback(async <T extends object>(
    ids: number[],
    endpoint: string,
    type: keyof EnhancedCacheState
  ) => {
    const uniqueIds = [...new Set(ids.filter(id => id && !isCacheValid(cache[type][id])))];
    if (uniqueIds.length === 0) return;

    const results = await Promise.allSettled(
      uniqueIds.map(id => 
        fetchWithRetry<T>(`${endpoint}/${id}/`)
          .then(data => ({ id, data }))
      )
    );
    
    const payload = results.reduce((acc, result) => {
      if (result.status === 'fulfilled' && result.value.data) {
        acc[result.value.id] = {
          data: result.value.data,
          timestamp: Date.now()
        };
      }
      return acc;
    }, {} as Record<number, CacheItem<T>>);
    
    if (Object.keys(payload).length > 0) {
      dispatch({ type, payload } as CacheAction);
    }
  }, [cache, fetchWithRetry, isCacheValid]);

  const getShipData = useCallback(async (shipTypeID: number): Promise<ShipData> => {
    if (!shipTypeID) return { name: 'Unknown Ship' };

    const cached = cache.ships[shipTypeID];
    if (isCacheValid(cached)) return cached.data;

    const data = await fetchWithRetry<{ name: string }>(
      `https://esi.evetech.net/latest/universe/types/${shipTypeID}/`
    );

    const result = { name: data?.name || `Ship ${shipTypeID}` };
    dispatch({
      type: 'ships',
      payload: { [shipTypeID]: { data: result, timestamp: Date.now() } }
    });
    
    return result;
  }, [cache.ships, fetchWithRetry, isCacheValid]);

  const getCorporationLogo = useCallback(async (corporationID: number): Promise<string> => {
    if (!corporationID) return '/default-logo.png';

    try {
      const data = await fetchWithRetry<{ px64x64: string }>(
        `https://esi.evetech.net/latest/corporations/${corporationID}/icons/`
      );
      return data?.px64x64 || '/default-logo.png';
    } catch {
      return '/default-logo.png';
    }
  }, [fetchWithRetry]);

  const getCorporationData = useCallback(async (corporationID: number): Promise<CorporationData> => {
    if (!corporationID) return { name: ' ', logo: '/default-logo.png' };

    const cached = cache.corporations[corporationID];
    if (isCacheValid(cached)) return cached.data;

    const nameData = await fetchWithRetry<{ name: string }>(
      `https://esi.evetech.net/latest/corporations/${corporationID}/`
    );
    const logo = await getCorporationLogo(corporationID);

    const result = {
      name: nameData?.name || `Corp ${corporationID}`,
      logo
    };
    
    dispatch({
      type: 'corporations',
      payload: { [corporationID]: { data: result, timestamp: Date.now() } }
    });
    
    return result;
  }, [cache.corporations, fetchWithRetry, getCorporationLogo, isCacheValid]);

  const getAllianceData = useCallback(async (allianceID?: number): Promise<AllianceData> => {
    if (!allianceID) return { name: 'Unknown Alliance' };

    const cached = cache.alliances[allianceID];
    if (isCacheValid(cached)) return cached.data;

    const data = await fetchWithRetry<{ name: string }>(
      `https://esi.evetech.net/latest/alliances/${allianceID}/`
    );

    const result = { name: data?.name || `Alliance ${allianceID}` };
    dispatch({
      type: 'alliances',
      payload: { [allianceID]: { data: result, timestamp: Date.now() } }
    });
    
    return result;
  }, [cache.alliances, fetchWithRetry, isCacheValid]);

  // Получение деталей killmail
  const fetchKillmailDetails = useCallback(async (killmail_id: number, hash: string): Promise<KillmailDetails | null> => {
    try {
      const response = await fetchWithRetry<KillmailDetails>(
        `https://esi.evetech.net/latest/killmails/${killmail_id}/${hash}/`
      );
      return response;
    } catch (err) {
      console.error('Error fetching killmail details:', err);
      return null;
    }
  }, [fetchWithRetry]);

  // Получение списка киллов
  const fetchKills = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchWithRetry<ZKillboardData[]>(
        `https://zkillboard.com/api/kills/solarSystemID/${solarSystemID}/`
      );
      
      if (Array.isArray(response)) {
        setKills(response.slice(0, MAX_KILLS_TO_PROCESS));
      }
    } catch (err) {
      console.error('Error details:', err);
    } finally {
      setLoading(false);
    }
  }, [solarSystemID, fetchWithRetry]);

  // Подготовка данных о киллах с пакетной загрузкой
  const prepareKills = useCallback(async () => {
    if (kills.length === 0) return;

    setLoading(true);
    
    try {
      // Собираем все ID для пакетной загрузки
      const allCorpIds: number[] = [];
      const allAllianceIds: number[] = [];
      const allShipIds: number[] = [];

      const killmailPromises = kills.map(kill => 
        fetchKillmailDetails(kill.killmail_id, kill.zkb.hash)
      );

      const killmails = (await Promise.all(killmailPromises)).filter(Boolean) as KillmailDetails[];

      killmails.forEach(details => {
        allCorpIds.push(details.victim.corporation_id);
        allShipIds.push(details.victim.ship_type_id);
        if (details.victim.alliance_id) allAllianceIds.push(details.victim.alliance_id);

        details.attackers.forEach(attacker => {
          allCorpIds.push(attacker.corporation_id);
          if (attacker.alliance_id) allAllianceIds.push(attacker.alliance_id);
          if (attacker.ship_type_id) allShipIds.push(attacker.ship_type_id);
        });
      });

      // Пакетная загрузка данных
      await Promise.all([
        fetchMultipleData<{ name: string }>(allCorpIds, 'https://esi.evetech.net/latest/corporations', 'corporations'),
        fetchMultipleData<{ name: string }>(allAllianceIds, 'https://esi.evetech.net/latest/alliances', 'alliances'),
        fetchMultipleData<{ name: string }>(allShipIds, 'https://esi.evetech.net/latest/universe/types', 'ships'),
      ]);

      // Подготовка финальных данных
      const prepared = await Promise.all(
        killmails.map(async details => {
          const [
            victimCorporation,
            victimAlliance,
            victimShip
          ] = await Promise.all([
            getCorporationData(details.victim.corporation_id),
            details.victim.alliance_id ? getAllianceData(details.victim.alliance_id) : Promise.resolve(undefined),
            getShipData(details.victim.ship_type_id)
          ]);

          const attackers = await Promise.all(
            details.attackers.map(async attacker => {
              const [
                corporation,
                alliance,
                ship
              ] = await Promise.all([
                getCorporationData(attacker.corporation_id),
                attacker.alliance_id ? getAllianceData(attacker.alliance_id) : Promise.resolve(undefined),
                attacker.ship_type_id ? getShipData(attacker.ship_type_id) : Promise.resolve(undefined)
              ]);

              return {
                corporation_name: corporation.name,
                corporation_logo: corporation.logo,
                corporation_id: attacker.corporation_id,
                alliance_name: alliance?.name,
                ship_name: ship?.name,
                ship_type_id: attacker.ship_type_id
              };
            })
          );

          const finalBlowAttacker = attackers.find(a => a.ship_type_id);

          return {
            killmail_id: details.killmail_id,
            killmail_time: details.killmail_time,
            victim: {
              corporation_name: victimCorporation.name,
              corporation_logo: victimCorporation.logo,
              corporation_id: details.victim.corporation_id,
              alliance_name: victimAlliance?.name,
              ship_name: victimShip.name,
              ship_type_id: details.victim.ship_type_id
            },
            attackers,
            finalBlowAttacker: finalBlowAttacker ? {
              ...finalBlowAttacker,
              corporation_id: finalBlowAttacker.corporation_id
            } : undefined
          };
        })
      );

      setPreparedKills(prepared.filter(Boolean) as PreparedKill[]);
    } catch (err) {
      console.error('Error details:', err);  
    } finally {
      setLoading(false);
    }
  }, [
    kills,
    fetchKillmailDetails,
    fetchMultipleData,
    getCorporationData,
    getAllianceData,
    getShipData
  ]);

  // Эффекты
  useEffect(() => {
    if (!solarSystemID || typeof solarSystemID !== 'number') {
      setLoading(false);
      return;
    }
    fetchKills();
  }, [solarSystemID, fetchKills]);

  useEffect(() => {
    if (kills.length > 0) {
      prepareKills();
    }
  }, [kills, prepareKills]);

  useEffect(() => {
    return () => {
      cancelAllRequests();
    };
  }, [cancelAllRequests]);

  // Пагинация
  const paginatedKills = useMemo(
    () => preparedKills.slice(page * itemsPerPage, (page + 1) * itemsPerPage),
    [preparedKills, page]
  );

  // Компоненты
  const ShipImage = React.memo(function ShipImage({ 
    typeId, 
    size = 32 
  }: { 
    typeId: number; 
    size?: number 
  }) {
    const [src, setSrc] = useState(
      `https://images.evetech.net/types/${typeId}/render?size=${size}`
    );

    return (
      <Image
        src={src}
        alt="Ship"
        width={size}
        height={size}
        className={`w-${size} h-${size} rounded`}
        onError={() => setSrc('/default-ship.png')}
        loading="lazy"
      />
    );
  });

  const CorporationImage = React.memo(function CorporationImage({ 
    corporationId, 
    size = 32 
  }: { 
    corporationId: number; 
    size?: number 
  }) {
    const cachedLogo = cache.corporations[corporationId]?.data.logo;
    const [src, setSrc] = useState(cachedLogo || '/default-logo.png');

    useEffect(() => {
      if (cachedLogo) {
        setSrc(cachedLogo);
      } else {
        const loadLogo = async () => {
          try {
            const logo = await getCorporationLogo(corporationId);
            setSrc(logo || '/default-logo.png');
            
            // Обновляем кэш
            if (logo) {
              const currentCorpData = cache.corporations[corporationId]?.data || { name: '' };
              dispatch({
                type: 'corporations',
                payload: { 
                  [corporationId]: { 
                    data: { ...currentCorpData, logo }, 
                    timestamp: Date.now() 
                  } 
                }
              });
            }
          } catch {
            setSrc('/default-logo.png');
          }
        };

        loadLogo();
      }
    }, [corporationId, cachedLogo, getCorporationLogo]);

    return (
      <Image
        src={src}
        alt="Corporation"
        width={size}
        height={size}
        className={`w-${size} h-${size} rounded`}
        onError={() => setSrc('/default-logo.png')}
        loading="lazy"
      />
    );
  });

  const Row = React.memo(function Row({ kill }: { kill: PreparedKill }) {
    return (
      <>
        <link 
          rel="preload" 
          href={`https://images.evetech.net/types/${kill.victim.ship_type_id}/render?size=32`} 
          as="image"
        />
        {cache.corporations[kill.victim.corporation_id]?.data.logo && (
          <link 
            rel="preload" 
            href={cache.corporations[kill.victim.corporation_id].data.logo} 
            as="image"
          />
        )}
        {kill.finalBlowAttacker?.ship_type_id && (
          <link 
            rel="preload" 
            href={`https://images.evetech.net/types/${kill.finalBlowAttacker.ship_type_id}/render?size=32`} 
            as="image"
          />
        )}
        {kill.finalBlowAttacker?.corporation_id && cache.corporations[kill.finalBlowAttacker.corporation_id]?.data.logo && (
          <link 
            rel="preload" 
            href={cache.corporations[kill.finalBlowAttacker.corporation_id].data.logo} 
            as="image"
          />
        )}

        <tr key={kill.killmail_id} className="text-slate-300">
          <td className="border border-slate-700 p-2 text-center">
            <a
              href={`https://zkillboard.com/kill/${kill.killmail_id}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              ZKB
            </a>
          </td>
          <td className="border border-slate-700 p-2 text-center">
            <div> 
            {new Date(kill.killmail_time).toLocaleDateString()}
            </div> 
            <div className='text-bold text-red-500'>
                {(() => {
                  const daysAgo = Math.floor(
                    (new Date().getTime() - new Date(kill.killmail_time).getTime()) /
                      (1000 * 60 * 60 * 24)
                  );
                  return daysAgo === 0 ? ' (сегодня)' : ` (${daysAgo} дн. назад)`;
                })()}
            </div>
          </td>
          <td className="border border-slate-700 p-2">
            <div className="flex items-center gap-2">
              <div className="w-1/2 flex items-center gap-2"> 
                <ShipImage typeId={kill.victim.ship_type_id} size={32} />
                <div>
                  <p>{kill.victim.ship_name}</p>
                </div>
              </div>
              
              <div className="w-1/2 flex items-center gap-2">
                <CorporationImage corporationId={kill.victim.corporation_id} size={32} />
                <div>              
                  <p className="text-sm text-slate-500">{kill.victim.corporation_name}</p>
                  {kill.victim.alliance_name && (
                    <p className="text-sm text-slate-500">{kill.victim.alliance_name}</p>
                  )}
                </div>
              </div>
            </div>
          </td>
          <td className="border border-slate-700 p-2">
            {kill.finalBlowAttacker ? (
              <div className="flex items-center gap-2">
                <div className="w-1/2 flex items-center gap-2"> 
                  {kill.finalBlowAttacker.ship_type_id && (
                    <ShipImage typeId={kill.finalBlowAttacker.ship_type_id} size={32} />
                  )}
                  <p>{kill.finalBlowAttacker.ship_name || 'Unknown Ship'}</p>
                </div>
                              
                <div className='w-1/2 flex items-center gap-2'>
                  <CorporationImage corporationId={kill.finalBlowAttacker.corporation_id} size={32} />
                  <div>
                    <p className="text-sm text-slate-500">{kill.finalBlowAttacker.corporation_name}</p>
                    {kill.finalBlowAttacker.alliance_name && (
                      <p className="text-sm text-slate-500">{kill.finalBlowAttacker.alliance_name}</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p>No final blow data</p>
            )}
          </td>
        </tr>
      </>
    );
  });

  // Состояния UI
  if (loading && preparedKills.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (preparedKills.length === 0) {
    return null;
  }

  return (
    <div className="overflow-x-auto mt-4">
      <table className="w-full border-collapse border border-slate-700">
        <thead>
          <tr className="bg-slate-800 text-slate-300">
            <th className="border border-slate-700 p-2">Ссылка на ZKB</th>
            <th className="border border-slate-700 p-2">Время кила</th>
            <th className="border border-slate-700 p-2">Уничтоженный корабль</th>
            <th className="border border-slate-700 p-2">Атакующая сторона</th>
          </tr>
        </thead>
        <tbody>
          {paginatedKills.map((kill) => (
            <Row key={kill.killmail_id} kill={kill} />
          ))}
        </tbody>
      </table>
      
     {/* Улучшенная пагинация с одинаковыми размерами кнопок */}
      <div className="flex items-center justify-center gap-1 mt-6">
        <button
          onClick={() => setPage(0)}
          disabled={page === 0}
          className={`w-8 h-8 flex items-center justify-center rounded-md border transition-all ${
            page === 0
              ? 'text-slate-500 bg-slate-800 cursor-not-allowed opacity-70'
              : 'text-white bg-gradient-to-r from-[#161A31] to-[#06091F] border-[rgba(105,113,162,0.4)] hover:from-[#06091F] hover:to-[#161A31]'
          }`}
          aria-label="First page"
        >
          <ChevronFirst className="w-4 h-4" />
        </button>
        
        <button
          onClick={() => setPage(prev => Math.max(prev - 1, 0))}
          disabled={page === 0}
          className={`w-8 h-8 flex items-center justify-center rounded-md border transition-all ${
            page === 0
              ? 'text-slate-500 bg-slate-800 cursor-not-allowed opacity-70'
              : 'text-white bg-gradient-to-r from-[#161A31] to-[#06091F] border-[rgba(105,113,162,0.4)] hover:from-[#06091F] hover:to-[#161A31]'
          }`}
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        
        <div className="flex items-center gap-1 mx-1">
          {Array.from({ length: Math.min(5, Math.ceil(preparedKills.length / itemsPerPage)) }).map((_, i) => {
            let pageIndex;
            const totalPages = Math.ceil(preparedKills.length / itemsPerPage);
            
            if (totalPages <= 5) {
              pageIndex = i;
            } else if (page < 3) {
              pageIndex = i;
            } else if (page > totalPages - 4) {
              pageIndex = totalPages - 5 + i;
            } else {
              pageIndex = page - 2 + i;
            }
            
            return (
              <button
                key={pageIndex}
                onClick={() => setPage(pageIndex)}
                className={`w-8 h-8 rounded-md border flex items-center justify-center text-sm transition-all ${
                  page === pageIndex
                    ? 'text-white bg-gradient-to-r from-[#161A31] to-[#06091F] border-[rgba(105,113,162,0.4)]'
                    : 'text-white bg-gradient-to-r from-[#161A31] to-[#06091F] border-[rgba(105,113,162,0.4)] hover:from-[#06091F] hover:to-[#161A31]'
                }`}
              >
                {pageIndex + 1}
              </button>
            );
          })}
          
          {Math.ceil(preparedKills.length / itemsPerPage) > 5 && (
            <span className="px-1 text-slate-400">...</span>
          )}
        </div>
        
        <button
          onClick={() => setPage(prev => prev + 1)}
          disabled={(page + 1) * itemsPerPage >= preparedKills.length}
          className={`w-8 h-8 flex items-center justify-center rounded-md border transition-all ${
            (page + 1) * itemsPerPage >= preparedKills.length
              ? 'text-slate-500 bg-slate-800 cursor-not-allowed opacity-70'
              : 'text-white bg-gradient-to-r from-[#161A31] to-[#06091F] border-[rgba(105,113,162,0.4)] hover:from-[#06091F] hover:to-[#161A31]'
          }`}
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        
        <button
          onClick={() => setPage(Math.ceil(preparedKills.length / itemsPerPage) - 1)}
          disabled={(page + 1) * itemsPerPage >= preparedKills.length}
          className={`w-8 h-8 flex items-center justify-center rounded-md border transition-all ${
            (page + 1) * itemsPerPage >= preparedKills.length
              ? 'text-slate-500 bg-slate-800 cursor-not-allowed opacity-70'
              : 'text-white bg-gradient-to-r from-[#161A31] to-[#06091F] border-[rgba(105,113,162,0.4)] hover:from-[#06091F] hover:to-[#161A31]'
          }`}
          aria-label="Last page"
        >
          <ChevronLast className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default KilledShips;






// import React, { useEffect, useState, useCallback, useReducer, useMemo, useRef } from 'react';
// import axios, { CancelTokenSource } from 'axios';
// import Image from "next/image";

// // Типы данных
// interface ZKillboardData {
//   killmail_id: number;
//   zkb: {
//     hash: string;
//   };
// }

// interface KillmailDetails {
//   killmail_id: number;
//   killmail_time: string;
//   solar_system_id: number;
//   victim: {
//     corporation_id: number;
//     alliance_id?: number;
//     ship_type_id: number;
//   };
//   attackers: Array<{
//     corporation_id: number;
//     alliance_id?: number;
//     weapon_type_id?: number;
//     final_blow: boolean;
//     ship_type_id?: number;
//   }>;
// }

// // Типы для кэша с TTL
// interface CacheItem<T> {
//   data: T;
//   timestamp: number;
// }

// interface ShipData {
//   name: string;
// }

// interface CorporationData {
//   name: string;
//   logo: string;
// }

// interface AllianceData {
//   name: string;
// }

// interface PreparedKill {
//   killmail_id: number;
//   killmail_time: string;
//   victim: {
//     corporation_name: string;
//     corporation_logo: string;
//     corporation_id: number;
//     alliance_name?: string;
//     ship_name: string;
//     ship_type_id: number;
//   };
//   attackers: Array<{
//     corporation_name: string;
//     corporation_logo: string;
//     corporation_id: number;
//     alliance_name?: string;
//     ship_name?: string;
//     ship_type_id?: number;
//   }>;
//   finalBlowAttacker?: {
//     corporation_name: string;
//     corporation_logo: string;
//     corporation_id: number;
//     alliance_name?: string;
//     ship_name?: string;
//     ship_type_id?: number;
//   };
// }

// interface EnhancedCacheState {
//   ships: Record<number, CacheItem<ShipData>>;
//   corporations: Record<number, CacheItem<CorporationData>>;
//   alliances: Record<number, CacheItem<AllianceData>>;
// }

// type CacheAction =
//   | { type: 'ships'; payload: Record<number, CacheItem<ShipData>> }
//   | { type: 'corporations'; payload: Record<number, CacheItem<CorporationData>> }
//   | { type: 'alliances'; payload: Record<number, CacheItem<AllianceData>> };

// // Константы
// const MAX_KILLS_TO_PROCESS = 20;
// const CACHE_TTL = 60 * 60 * 1000; // 1 час
// const REQUEST_TIMEOUT = 1000; // 8 секунд
// const initialState: EnhancedCacheState = {
//   ships: {},
//   corporations: {},
//   alliances: {},
// };

// // Редюсер для кэша
// function cacheReducer(state: EnhancedCacheState, action: CacheAction): EnhancedCacheState {
//   return {
//     ...state,
//     [action.type]: { ...state[action.type], ...action.payload },
//   };
// }

// const KilledShips: React.FC<{ solarSystemID: number }> = ({ solarSystemID }) => {
//   const [kills, setKills] = useState<ZKillboardData[]>([]);
//   const [preparedKills, setPreparedKills] = useState<PreparedKill[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);
//   const [page, setPage] = useState(0);
//   const [cache, dispatch] = useReducer(cacheReducer, initialState);
//   const cancelTokenSources = useRef<CancelTokenSource[]>([]);

//   const itemsPerPage = 10;

//   // Проверка валидности кэша
//   const isCacheValid = useCallback(<T,>(cacheItem: CacheItem<T> | undefined): boolean => {
//     return cacheItem !== undefined && Date.now() - cacheItem.timestamp < CACHE_TTL;
//   }, []);

//   // Утилиты для работы с запросами
//   const createCancelToken = useCallback(() => {
//     const source = axios.CancelToken.source();
//     cancelTokenSources.current.push(source);
//     return source.token;
//   }, []);

//   const cancelAllRequests = useCallback(() => {
//     cancelTokenSources.current.forEach(source => source.cancel('Request canceled'));
//     cancelTokenSources.current = [];
//   }, []);

//   // Улучшенная функция запроса с повторами
//   const fetchWithRetry = useCallback(async <T extends object>(
//     url: string,
//     retries = 1, // Попытки повтора в случае ошибки - можно настроить в зависимости от ситуации - было 3
//     delay = 1000
//   ): Promise<T | null> => {
//     // Добавляем небольшую задержку перед первым запросом
//     if (retries === 1) {
//       await new Promise(resolve => setTimeout(resolve, 200));
//     }
    
//     const cancelToken = createCancelToken();
    
//     try {
//       const response = await axios.get<T>(url, {
//         timeout: REQUEST_TIMEOUT,
//         cancelToken,
//         validateStatus: (status) => status < 500
//       });
      
//       cancelTokenSources.current = cancelTokenSources.current.filter(
//         src => src.token !== cancelToken
//       );
      
//       return response.data;
//     } catch (err) {
//       cancelTokenSources.current = cancelTokenSources.current.filter(
//         src => src.token !== cancelToken
//       );
      
//       if (axios.isCancel(err)) {
//         return null;
//       }
      
//       if (retries > 0) {
//         await new Promise(resolve => setTimeout(resolve, delay));
//         return fetchWithRetry<T>(url, retries - 1, delay * 2);
//       }
      
//       return null;
//     }
//   }, [createCancelToken]);

//   // Пакетная загрузка данных
//   const fetchMultipleData = useCallback(async <T extends object>(
//     ids: number[],
//     endpoint: string,
//     type: keyof EnhancedCacheState
//   ) => {
//     const uniqueIds = [...new Set(ids.filter(id => id && !isCacheValid(cache[type][id])))];
//     if (uniqueIds.length === 0) return;

//     const results = await Promise.allSettled(
//       uniqueIds.map(id => 
//         fetchWithRetry<T>(`${endpoint}/${id}/`)
//           .then(data => ({ id, data }))
//       )
//     );
    
//     const payload = results.reduce((acc, result) => {
//       if (result.status === 'fulfilled' && result.value.data) {
//         acc[result.value.id] = {
//           data: result.value.data,
//           timestamp: Date.now()
//         };
//       }
//       return acc;
//     }, {} as Record<number, CacheItem<T>>);
    
//     if (Object.keys(payload).length > 0) {
//       dispatch({ type, payload } as CacheAction);
//     }
//   }, [cache, fetchWithRetry, isCacheValid]);

//   const getShipData = useCallback(async (shipTypeID: number): Promise<ShipData> => {
//     if (!shipTypeID) return { name: 'Unknown Ship' };

//     const cached = cache.ships[shipTypeID];
//     if (isCacheValid(cached)) return cached.data;

//     const data = await fetchWithRetry<{ name: string }>(
//       `https://esi.evetech.net/latest/universe/types/${shipTypeID}/`
//     );

//     const result = { name: data?.name || `Ship ${shipTypeID}` };
//     dispatch({
//       type: 'ships',
//       payload: { [shipTypeID]: { data: result, timestamp: Date.now() } }
//     });
    
//     return result;
//   }, [cache.ships, fetchWithRetry, isCacheValid]);

//   const getCorporationLogo = useCallback(async (corporationID: number): Promise<string> => {
//     if (!corporationID) return '/default-logo.png';

//     try {
//       const data = await fetchWithRetry<{ px64x64: string }>(
//         `https://esi.evetech.net/latest/corporations/${corporationID}/icons/`
//       );
//       return data?.px64x64 || '/default-logo.png';
//     } catch {
//       return '/default-logo.png';
//     }
//   }, [fetchWithRetry]);

//   const getCorporationData = useCallback(async (corporationID: number): Promise<CorporationData> => {
//     if (!corporationID) return { name: ' ', logo: '/default-logo.png' };

//     const cached = cache.corporations[corporationID];
//     if (isCacheValid(cached)) return cached.data;

//     const nameData = await fetchWithRetry<{ name: string }>(
//       `https://esi.evetech.net/latest/corporations/${corporationID}/`
//     );
//     const logo = await getCorporationLogo(corporationID);

//     const result = {
//       name: nameData?.name || `Corp ${corporationID}`,
//       logo
//     };
    
//     dispatch({
//       type: 'corporations',
//       payload: { [corporationID]: { data: result, timestamp: Date.now() } }
//     });
    
//     return result;
//   }, [cache.corporations, fetchWithRetry, getCorporationLogo, isCacheValid]);

//   const getAllianceData = useCallback(async (allianceID?: number): Promise<AllianceData> => {
//     if (!allianceID) return { name: 'Unknown Alliance' };

//     const cached = cache.alliances[allianceID];
//     if (isCacheValid(cached)) return cached.data;

//     const data = await fetchWithRetry<{ name: string }>(
//       `https://esi.evetech.net/latest/alliances/${allianceID}/`
//     );

//     const result = { name: data?.name || `Alliance ${allianceID}` };
//     dispatch({
//       type: 'alliances',
//       payload: { [allianceID]: { data: result, timestamp: Date.now() } }
//     });
    
//     return result;
//   }, [cache.alliances, fetchWithRetry, isCacheValid]);

//   // Получение деталей killmail
//   const fetchKillmailDetails = useCallback(async (killmail_id: number, hash: string): Promise<KillmailDetails | null> => {
//     try {
//       const response = await fetchWithRetry<KillmailDetails>(
//         `https://esi.evetech.net/latest/killmails/${killmail_id}/${hash}/`
//       );
//       return response;
//     } catch (err) {
//       console.error('Error fetching killmail details:', err);
//       return null;
//     }
//   }, [fetchWithRetry]);

//   // Получение списка киллов
//   const fetchKills = useCallback(async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const response = await fetchWithRetry<ZKillboardData[]>(
//         `https://zkillboard.com/api/kills/solarSystemID/${solarSystemID}/`
//       );
      
//       if (Array.isArray(response)) {
//         setKills(response.slice(0, MAX_KILLS_TO_PROCESS));
//       } else {
//         setError('Invalid data format from zKillboard');
//       }
//     } catch (err) {
//       console.error('Error details:', err);
//       setError('Failed to load kills data');
//     } finally {
//       setLoading(false);
//     }
//   }, [solarSystemID, fetchWithRetry]);

//   // Подготовка данных о киллах с пакетной загрузкой
//   const prepareKills = useCallback(async () => {
//     if (kills.length === 0) return;

//     setLoading(true);
//     setError(null);
    
//     try {
//       // Собираем все ID для пакетной загрузки
//       const allCorpIds: number[] = [];
//       const allAllianceIds: number[] = [];
//       const allShipIds: number[] = [];

//       const killmailPromises = kills.map(kill => 
//         fetchKillmailDetails(kill.killmail_id, kill.zkb.hash)
//       );

//       const killmails = (await Promise.all(killmailPromises)).filter(Boolean) as KillmailDetails[];

//       killmails.forEach(details => {
//         allCorpIds.push(details.victim.corporation_id);
//         allShipIds.push(details.victim.ship_type_id);
//         if (details.victim.alliance_id) allAllianceIds.push(details.victim.alliance_id);

//         details.attackers.forEach(attacker => {
//           allCorpIds.push(attacker.corporation_id);
//           if (attacker.alliance_id) allAllianceIds.push(attacker.alliance_id);
//           if (attacker.ship_type_id) allShipIds.push(attacker.ship_type_id);
//         });
//       });

//       // Пакетная загрузка данных
//       await Promise.all([
//         fetchMultipleData<{ name: string }>(allCorpIds, 'https://esi.evetech.net/latest/corporations', 'corporations'),
//         fetchMultipleData<{ name: string }>(allAllianceIds, 'https://esi.evetech.net/latest/alliances', 'alliances'),
//         fetchMultipleData<{ name: string }>(allShipIds, 'https://esi.evetech.net/latest/universe/types', 'ships'),
//       ]);

//       // Подготовка финальных данных
//       const prepared = await Promise.all(
//         killmails.map(async details => {
//           const [
//             victimCorporation,
//             victimAlliance,
//             victimShip
//           ] = await Promise.all([
//             getCorporationData(details.victim.corporation_id),
//             details.victim.alliance_id ? getAllianceData(details.victim.alliance_id) : Promise.resolve(undefined),
//             getShipData(details.victim.ship_type_id)
//           ]);

//           const attackers = await Promise.all(
//             details.attackers.map(async attacker => {
//               const [
//                 corporation,
//                 alliance,
//                 ship
//               ] = await Promise.all([
//                 getCorporationData(attacker.corporation_id),
//                 attacker.alliance_id ? getAllianceData(attacker.alliance_id) : Promise.resolve(undefined),
//                 attacker.ship_type_id ? getShipData(attacker.ship_type_id) : Promise.resolve(undefined)
//               ]);

//               return {
//                 corporation_name: corporation.name,
//                 corporation_logo: corporation.logo,
//                 corporation_id: attacker.corporation_id,
//                 alliance_name: alliance?.name,
//                 ship_name: ship?.name,
//                 ship_type_id: attacker.ship_type_id
//               };
//             })
//           );

//           const finalBlowAttacker = attackers.find(a => a.ship_type_id);

//           return {
//             killmail_id: details.killmail_id,
//             killmail_time: details.killmail_time,
//             victim: {
//               corporation_name: victimCorporation.name,
//               corporation_logo: victimCorporation.logo,
//               corporation_id: details.victim.corporation_id,
//               alliance_name: victimAlliance?.name,
//               ship_name: victimShip.name,
//               ship_type_id: details.victim.ship_type_id
//             },
//             attackers,
//             finalBlowAttacker: finalBlowAttacker ? {
//               ...finalBlowAttacker,
//               corporation_id: finalBlowAttacker.corporation_id
//             } : undefined
//           };
//         })
//       );

//       setPreparedKills(prepared.filter(Boolean) as PreparedKill[]);
//     } catch (err) {
//       console.error('Error details:', err);  
//       setError('Failed to prepare kills data');
//     } finally {
//       setLoading(false);
//     }
//   }, [
//     kills,
//     fetchKillmailDetails,
//     fetchMultipleData,
//     getCorporationData,
//     getAllianceData,
//     getShipData
//   ]);

//   // Эффекты
//   useEffect(() => {
//     if (!solarSystemID || typeof solarSystemID !== 'number') {
//       setError('Invalid solar system ID');
//       setLoading(false);
//       return;
//     }
//     fetchKills();
//   }, [solarSystemID, fetchKills]);

//   useEffect(() => {
//     if (kills.length > 0) {
//       prepareKills();
//     }
//   }, [kills, prepareKills]);

//   useEffect(() => {
//     return () => {
//       cancelAllRequests();
//     };
//   }, [cancelAllRequests]);

//   // Пагинация
//   const paginatedKills = useMemo(
//     () => preparedKills.slice(page * itemsPerPage, (page + 1) * itemsPerPage),
//     [preparedKills, page]
//   );

//   // Компоненты
//   const ShipImage = React.memo(function ShipImage({ 
//     typeId, 
//     size = 32 
//   }: { 
//     typeId: number; 
//     size?: number 
//   }) {
//     const [src, setSrc] = useState(
//       `https://images.evetech.net/types/${typeId}/render?size=${size}`
//     );

//     return (
//       <Image
//         src={src}
//         alt="Ship"
//         width={size}
//         height={size}
//         className={`w-${size} h-${size} rounded`}
//         onError={() => setSrc('/default-ship.png')}
//         loading="lazy"
//         // placeholder="blur"
//         // blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkqAcAAIUAgUW0RjgAAAAASUVORK5CYII="
//       />
//     );
//   });

//   const CorporationImage = React.memo(function CorporationImage({ 
//     corporationId, 
//     size = 32 
//   }: { 
//     corporationId: number; 
//     size?: number 
//   }) {
//     const cachedLogo = cache.corporations[corporationId]?.data.logo;
//     const [src, setSrc] = useState(cachedLogo || '/default-logo.png');

//     useEffect(() => {
//       if (cachedLogo) {
//         setSrc(cachedLogo);
//       } else {
//         const loadLogo = async () => {
//           try {
//             const logo = await getCorporationLogo(corporationId);
//             setSrc(logo || '/default-logo.png');
            
//             // Обновляем кэш
//             if (logo) {
//               const currentCorpData = cache.corporations[corporationId]?.data || { name: '' };
//               dispatch({
//                 type: 'corporations',
//                 payload: { 
//                   [corporationId]: { 
//                     data: { ...currentCorpData, logo }, 
//                     timestamp: Date.now() 
//                   } 
//                 }
//               });
//             }
//           } catch {
//             setSrc('/default-logo.png');
//           }
//         };

//         loadLogo();
//       }
//     }, [corporationId, cachedLogo, getCorporationLogo]);

//     return (
//       <Image
//         src={src}
//         alt="Corporation"
//         width={size}
//         height={size}
//         className={`w-${size} h-${size} rounded`}
//         onError={() => setSrc('/default-logo.png')}
//         loading="lazy"
//         // placeholder="blur"
//         // blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkqAcAAIUAgUW0RjgAAAAASUVORK5CYII="
//       />
//     );
//   });

//   const Row = React.memo(function Row({ kill }: { kill: PreparedKill }) {
//     // Preload images
//     return (
//       <>
//         <link 
//           rel="preload" 
//           href={`https://images.evetech.net/types/${kill.victim.ship_type_id}/render?size=32`} 
//           as="image"
//         />
//         {cache.corporations[kill.victim.corporation_id]?.data.logo && (
//           <link 
//             rel="preload" 
//             href={cache.corporations[kill.victim.corporation_id].data.logo} 
//             as="image"
//           />
//         )}
//         {kill.finalBlowAttacker?.ship_type_id && (
//           <link 
//             rel="preload" 
//             href={`https://images.evetech.net/types/${kill.finalBlowAttacker.ship_type_id}/render?size=32`} 
//             as="image"
//           />
//         )}
//         {kill.finalBlowAttacker?.corporation_id && cache.corporations[kill.finalBlowAttacker.corporation_id]?.data.logo && (
//           <link 
//             rel="preload" 
//             href={cache.corporations[kill.finalBlowAttacker.corporation_id].data.logo} 
//             as="image"
//           />
//         )}

//         <tr key={kill.killmail_id} className="text-slate-300">
//           <td className="border border-slate-700 p-2 text-center">
//             <a
//               href={`https://zkillboard.com/kill/${kill.killmail_id}/`}
//               target="_blank"
//               rel="noopener noreferrer"
//               className="text-blue-400 hover:underline"
//             >
//               ZKB
//             </a>
//           </td>
//           <td className="border border-slate-700 p-2 text-center">
//             <div> 
//             {new Date(kill.killmail_time).toLocaleDateString()}
//             </div> 
//             <div className='text-bold text-red-500'>
//                 {(() => {
//                   const daysAgo = Math.floor(
//                     (new Date().getTime() - new Date(kill.killmail_time).getTime()) /
//                       (1000 * 60 * 60 * 24)
//                   );
//                   return daysAgo === 0 ? ' (сегодня)' : ` (${daysAgo} дн. назад)`;
//                 })()}
//             </div>
//           </td>
//           <td className="border border-slate-700 p-2">
//             <div className="flex items-center gap-2">
//               <div className="w-1/2 flex items-center gap-2"> 
//                 <ShipImage typeId={kill.victim.ship_type_id} size={32} />
//                 <div>
//                   <p>{kill.victim.ship_name}</p>
//                 </div>
//               </div>
              
//               <div className="w-1/2 flex items-center gap-2">
//                 <CorporationImage corporationId={kill.victim.corporation_id} size={32} />
//                 <div>              
//                   <p className="text-sm text-slate-500">{kill.victim.corporation_name}</p>
//                   {kill.victim.alliance_name && (
//                     <p className="text-sm text-slate-500">{kill.victim.alliance_name}</p>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </td>
//           <td className="border border-slate-700 p-2">
//             {kill.finalBlowAttacker ? (
//               <div className="flex items-center gap-2">
//                 <div className="w-1/2 flex items-center gap-2"> 
//                   {kill.finalBlowAttacker.ship_type_id && (
//                     <ShipImage typeId={kill.finalBlowAttacker.ship_type_id} size={32} />
//                   )}
//                   <p>{kill.finalBlowAttacker.ship_name || 'Unknown Ship'}</p>
//                 </div>
                              
//                 <div className='w-1/2 flex items-center gap-2'>
//                   <CorporationImage corporationId={kill.finalBlowAttacker.corporation_id} size={32} />
//                   <div>
//                     <p className="text-sm text-slate-500">{kill.finalBlowAttacker.corporation_name}</p>
//                     {kill.finalBlowAttacker.alliance_name && (
//                       <p className="text-sm text-slate-500">{kill.finalBlowAttacker.alliance_name}</p>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             ) : (
//               <p>No final blow data</p>
//             )}
//           </td>
//         </tr>
//       </>
//     );
//   });

//   // Состояния UI
//   if (loading && preparedKills.length === 0) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//       </div>
//     );
//   }
// //!вывод ошибки если н загрузятся данные и кнопки ретри
//   if (error) {
//     return (
//       <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
//         <strong className="font-bold">Error: </strong>
//         <span className="block sm:inline">{error}</span>
//         <button 
//           onClick={() => {
//             setError(null);
//             fetchKills();
//           }}
//           className="absolute top-0 bottom-0 right-0 px-4 py-3"
//         >
//           <svg className="fill-current h-6 w-6 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
//             <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
//           </svg>
//         </button>
//       </div>
//     );
//   }

//   if (preparedKills.length === 0) {
//     return (
//       <div className="text-center py-8">
//         <p className="text-xl text-slate-400">No kill data available for this system</p>
//         <button
//           onClick={fetchKills}
//           className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
//         >
//           Retry
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="overflow-x-auto">
//       <div className="flex justify-between items-center mb-4">
//         {/* <h2 className="text-xl font-bold">Recent Ship Kills (Last {MAX_KILLS_TO_PROCESS}) in system: {solarSystemID}</h2> */}
//       </div>

//       <table className="w-full border-collapse border border-slate-700">
//         <thead>
//           <tr className="bg-slate-800 text-slate-300">
//             <th className="border border-slate-700 p-2">Ссылка на ZKB</th>
//             <th className="border border-slate-700 p-2">Время кила</th>
//             <th className="border border-slate-700 p-2">Уничтоженный корабль</th>
//             <th className="border border-slate-700 p-2">Атакующая сторона</th>
//           </tr>
//         </thead>
//         <tbody>
//           {paginatedKills.map((kill) => (
//             <Row key={kill.killmail_id} kill={kill} />
//           ))}
//         </tbody>
//       </table>
//       <div className="flex gap-2 justify-center mt-4">
//         <button
//           onClick={() => setPage(prev => Math.max(prev - 1, 0))}
//           disabled={page === 0}
//           className="px-3 py-1 bg-slate-700 rounded disabled:opacity-50"
//         >
//           Previous
//         </button>
//         <span className="px-3 py-1">
//           Page {page + 1} of {Math.ceil(preparedKills.length / itemsPerPage)}
//         </span>
//         <button
//           onClick={() => setPage(prev => prev + 1)}
//           disabled={(page + 1) * itemsPerPage >= preparedKills.length}
//           className="px-3 py-1 bg-slate-700 rounded disabled:opacity-50"
//         >
//           Next
//         </button>
//       </div>
//     </div>
//   );
// };

// export default KilledShips;



//!с отображением аватарок пилотов и корпораций
// import React, { useEffect, useState, useCallback, useReducer, useMemo, useRef } from 'react';
// import axios, { CancelTokenSource } from 'axios';
// import Image from "next/image";

// // Типы данных
// interface ZKillboardData {
//   killmail_id: number;
//   zkb: {
//     hash: string;
//   };
// }

// interface KillmailDetails {
//   killmail_id: number;
//   killmail_time: string;
//   solar_system_id: number;
//   victim: {
//     corporation_id: number;
//     alliance_id?: number;
//     ship_type_id: number;
//   };
//   attackers: Array<{
//     corporation_id: number;
//     alliance_id?: number;
//     weapon_type_id?: number;
//     final_blow: boolean;
//     ship_type_id?: number;
//   }>;
// }

// // Типы для кэша с TTL
// interface CacheItem<T> {
//   data: T;
//   timestamp: number;
// }

// interface ShipData {
//   name: string;
// }

// interface CorporationData {
//   name: string;
//   logo: string;
// }

// interface AllianceData {
//   name: string;
// }

// interface PreparedKill {
//   killmail_id: number;
//   killmail_time: string;
//   victim: {
//     corporation_name: string;
//     corporation_logo: string;
//     corporation_id: number;
//     alliance_name?: string;
//     ship_name: string;
//     ship_type_id: number;
//   };
//   attackers: Array<{
//     corporation_name: string;
//     corporation_logo: string;
//     corporation_id: number;
//     alliance_name?: string;
//     ship_name?: string;
//     ship_type_id?: number;
//   }>;
//   finalBlowAttacker?: {
//     corporation_name: string;
//     corporation_logo: string;
//     corporation_id: number;
//     alliance_name?: string;
//     ship_name?: string;
//     ship_type_id?: number;
//   };
// }

// interface EnhancedCacheState {
//   ships: Record<number, CacheItem<ShipData>>;
//   corporations: Record<number, CacheItem<CorporationData>>;
//   alliances: Record<number, CacheItem<AllianceData>>;
// }

// type CacheAction =
//   | { type: 'ships'; payload: Record<number, CacheItem<ShipData>> }
//   | { type: 'corporations'; payload: Record<number, CacheItem<CorporationData>> }
//   | { type: 'alliances'; payload: Record<number, CacheItem<AllianceData>> };

// // Константы
// const MAX_KILLS_TO_PROCESS = 20;
// const CACHE_TTL = 60 * 60 * 1000; // 1 час
// const REQUEST_TIMEOUT = 1000; // 8 секунд
// const initialState: EnhancedCacheState = {
//   ships: {},
//   corporations: {},
//   alliances: {},
// };

// // Редюсер для кэша
// function cacheReducer(state: EnhancedCacheState, action: CacheAction): EnhancedCacheState {
//   return {
//     ...state,
//     [action.type]: { ...state[action.type], ...action.payload },
//   };
// }

// const KilledShips: React.FC<{ solarSystemID: number }> = ({ solarSystemID }) => {
//   const [kills, setKills] = useState<ZKillboardData[]>([]);
//   const [preparedKills, setPreparedKills] = useState<PreparedKill[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);
//   const [page, setPage] = useState(0);
//   const [cache, dispatch] = useReducer(cacheReducer, initialState);
//   const cancelTokenSources = useRef<CancelTokenSource[]>([]);

//   const itemsPerPage = 10;

//   // Проверка валидности кэша
//   const isCacheValid = useCallback(<T,>(cacheItem: CacheItem<T> | undefined): boolean => {
//     return cacheItem !== undefined && Date.now() - cacheItem.timestamp < CACHE_TTL;
//   }, []);

//   // Утилиты для работы с запросами
//   const createCancelToken = useCallback(() => {
//     const source = axios.CancelToken.source();
//     cancelTokenSources.current.push(source);
//     return source.token;
//   }, []);

//   const cancelAllRequests = useCallback(() => {
//     cancelTokenSources.current.forEach(source => source.cancel('Request canceled'));
//     cancelTokenSources.current = [];
//   }, []);

//   // Улучшенная функция запроса с повторами
//   const fetchWithRetry = useCallback(async <T extends object>(
//     url: string,
//     retries = 3,
//     delay = 1000
//   ): Promise<T | null> => {
//     const cancelToken = createCancelToken();
    
//     try {
//       const response = await axios.get<T>(url, {
//         timeout: REQUEST_TIMEOUT,
//         cancelToken,
//         validateStatus: (status) => status < 500
//       });
      
//       cancelTokenSources.current = cancelTokenSources.current.filter(
//         src => src.token !== cancelToken
//       );
      
//       return response.data;
//     } catch (err) {
//       cancelTokenSources.current = cancelTokenSources.current.filter(
//         src => src.token !== cancelToken
//       );
      
//       if (axios.isCancel(err)) {
//         return null;
//       }
      
//       if (retries > 0) {
//         await new Promise(resolve => setTimeout(resolve, delay));
//         return fetchWithRetry<T>(url, retries - 1, delay * 2);
//       }
      
//       return null;
//     }
//   }, [createCancelToken]);

//   // Пакетная загрузка данных
//   const fetchMultipleData = useCallback(async <T extends object>(
//     ids: number[],
//     endpoint: string,
//     type: keyof EnhancedCacheState
//   ) => {
//     const uniqueIds = [...new Set(ids.filter(id => id && !isCacheValid(cache[type][id])))];
//     if (uniqueIds.length === 0) return;

//     const results = await Promise.allSettled(
//       uniqueIds.map(id => 
//         fetchWithRetry<T>(`${endpoint}/${id}/`)
//           .then(data => ({ id, data }))
//       )
//     );
    
//     const payload = results.reduce((acc, result) => {
//       if (result.status === 'fulfilled' && result.value.data) {
//         acc[result.value.id] = {
//           data: result.value.data,
//           timestamp: Date.now()
//         };
//       }
//       return acc;
//     }, {} as Record<number, CacheItem<T>>);
    
//     if (Object.keys(payload).length > 0) {
//       dispatch({ type, payload } as CacheAction);
//     }
//   }, [cache, fetchWithRetry, isCacheValid]);

//   const getShipData = useCallback(async (shipTypeID: number): Promise<ShipData> => {
//     if (!shipTypeID) return { name: 'Unknown Ship' };

//     const cached = cache.ships[shipTypeID];
//     if (isCacheValid(cached)) return cached.data;

//     const data = await fetchWithRetry<{ name: string }>(
//       `https://esi.evetech.net/latest/universe/types/${shipTypeID}/`
//     );

//     const result = { name: data?.name || `Ship ${shipTypeID}` };
//     dispatch({
//       type: 'ships',
//       payload: { [shipTypeID]: { data: result, timestamp: Date.now() } }
//     });
    
//     return result;
//   }, [cache.ships, fetchWithRetry, isCacheValid]);

//   const getCorporationLogo = useCallback(async (corporationID: number): Promise<string> => {
//     if (!corporationID) return '/default-logo.png';

//     try {
//       const data = await fetchWithRetry<{ px64x64: string }>(
//         `https://esi.evetech.net/latest/corporations/${corporationID}/icons/`
//       );
//       return data?.px64x64 || '/default-logo.png';
//     } catch {
//       return '/default-logo.png';
//     }
//   }, [fetchWithRetry]);

//   const getCorporationData = useCallback(async (corporationID: number): Promise<CorporationData> => {
//     // if (!corporationID) return { name: 'Unknown Corporation', logo: '/default-logo.png' };
//     if (!corporationID) return { name: ' ', logo: '/default-logo.png' };

//     const cached = cache.corporations[corporationID];
//     if (isCacheValid(cached)) return cached.data;

//     const nameData = await fetchWithRetry<{ name: string }>(
//       `https://esi.evetech.net/latest/corporations/${corporationID}/`
//     );
//     const logo = await getCorporationLogo(corporationID);

//     const result = {
//       name: nameData?.name || `Corp ${corporationID}`,
//       logo
//     };
    
//     dispatch({
//       type: 'corporations',
//       payload: { [corporationID]: { data: result, timestamp: Date.now() } }
//     });
    
//     return result;
//   }, [cache.corporations, fetchWithRetry, getCorporationLogo, isCacheValid]);

//   const getAllianceData = useCallback(async (allianceID?: number): Promise<AllianceData> => {
//     if (!allianceID) return { name: 'Unknown Alliance' };

//     const cached = cache.alliances[allianceID];
//     if (isCacheValid(cached)) return cached.data;

//     const data = await fetchWithRetry<{ name: string }>(
//       `https://esi.evetech.net/latest/alliances/${allianceID}/`
//     );

//     const result = { name: data?.name || `Alliance ${allianceID}` };
//     dispatch({
//       type: 'alliances',
//       payload: { [allianceID]: { data: result, timestamp: Date.now() } }
//     });
    
//     return result;
//   }, [cache.alliances, fetchWithRetry, isCacheValid]);

//   // Получение деталей killmail
//   const fetchKillmailDetails = useCallback(async (killmail_id: number, hash: string): Promise<KillmailDetails | null> => {
//     try {
//       const response = await fetchWithRetry<KillmailDetails>(
//         `https://esi.evetech.net/latest/killmails/${killmail_id}/${hash}/`
//       );
//       return response;
//     } catch (err) {
//       console.error('Error fetching killmail details:', err);
//       return null;
//     }
//   }, [fetchWithRetry]);

//   // Получение списка киллов
//   const fetchKills = useCallback(async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const response = await fetchWithRetry<ZKillboardData[]>(
//         `https://zkillboard.com/api/kills/solarSystemID/${solarSystemID}/`
//       );
      
//       if (Array.isArray(response)) {
//         setKills(response.slice(0, MAX_KILLS_TO_PROCESS));
//       } else {
//         setError('Invalid data format from zKillboard');
//       }
//     } catch (err) {
//       console.error('Error details:', err);
//       setError('Failed to load kills data');
//     } finally {
//       setLoading(false);
//     }
//   }, [solarSystemID, fetchWithRetry]);

//   // Подготовка данных о киллах с пакетной загрузкой
//   const prepareKills = useCallback(async () => {
//     if (kills.length === 0) return;

//     setLoading(true);
//     setError(null);
    
//     try {
//       // Собираем все ID для пакетной загрузки
//       const allCorpIds: number[] = [];
//       const allAllianceIds: number[] = [];
//       const allShipIds: number[] = [];

//       const killmailPromises = kills.map(kill => 
//         fetchKillmailDetails(kill.killmail_id, kill.zkb.hash)
//       );

//       const killmails = (await Promise.all(killmailPromises)).filter(Boolean) as KillmailDetails[];

//       killmails.forEach(details => {
//         allCorpIds.push(details.victim.corporation_id);
//         allShipIds.push(details.victim.ship_type_id);
//         if (details.victim.alliance_id) allAllianceIds.push(details.victim.alliance_id);

//         details.attackers.forEach(attacker => {
//           allCorpIds.push(attacker.corporation_id);
//           if (attacker.alliance_id) allAllianceIds.push(attacker.alliance_id);
//           if (attacker.ship_type_id) allShipIds.push(attacker.ship_type_id);
//         });
//       });

//       // Пакетная загрузка данных
//       await Promise.all([
//         fetchMultipleData<{ name: string }>(allCorpIds, 'https://esi.evetech.net/latest/corporations', 'corporations'),
//         fetchMultipleData<{ name: string }>(allAllianceIds, 'https://esi.evetech.net/latest/alliances', 'alliances'),
//         fetchMultipleData<{ name: string }>(allShipIds, 'https://esi.evetech.net/latest/universe/types', 'ships'),
//       ]);

//       // Подготовка финальных данных
//       const prepared = await Promise.all(
//         killmails.map(async details => {
//           const [
//             victimCorporation,
//             victimAlliance,
//             victimShip
//           ] = await Promise.all([
//             getCorporationData(details.victim.corporation_id),
//             details.victim.alliance_id ? getAllianceData(details.victim.alliance_id) : Promise.resolve(undefined),
//             getShipData(details.victim.ship_type_id)
//           ]);

//           const attackers = await Promise.all(
//             details.attackers.map(async attacker => {
//               const [
//                 corporation,
//                 alliance,
//                 ship
//               ] = await Promise.all([
//                 getCorporationData(attacker.corporation_id),
//                 attacker.alliance_id ? getAllianceData(attacker.alliance_id) : Promise.resolve(undefined),
//                 attacker.ship_type_id ? getShipData(attacker.ship_type_id) : Promise.resolve(undefined)
//               ]);

//               return {
//                 corporation_name: corporation.name,
//                 corporation_logo: corporation.logo,
//                 corporation_id: attacker.corporation_id,
//                 alliance_name: alliance?.name,
//                 ship_name: ship?.name,
//                 ship_type_id: attacker.ship_type_id
//               };
//             })
//           );

//           const finalBlowAttacker = attackers.find(a => a.ship_type_id);

//           return {
//             killmail_id: details.killmail_id,
//             killmail_time: details.killmail_time,
//             victim: {
//               corporation_name: victimCorporation.name,
//               corporation_logo: victimCorporation.logo,
//               corporation_id: details.victim.corporation_id,
//               alliance_name: victimAlliance?.name,
//               ship_name: victimShip.name,
//               ship_type_id: details.victim.ship_type_id
//             },
//             attackers,
//             finalBlowAttacker: finalBlowAttacker ? {
//               ...finalBlowAttacker,
//               corporation_id: finalBlowAttacker.corporation_id
//             } : undefined
//           };
//         })
//       );

//       setPreparedKills(prepared.filter(Boolean) as PreparedKill[]);
//     } catch (err) {
//       console.error('Error details:', err);  
//       setError('Failed to prepare kills data');
//     } finally {
//       setLoading(false);
//     }
//   }, [
//     kills,
//     fetchKillmailDetails,
//     fetchMultipleData,
//     getCorporationData,
//     getAllianceData,
//     getShipData
//   ]);

//   // Эффекты
//   useEffect(() => {
//     if (!solarSystemID || typeof solarSystemID !== 'number') {
//       setError('Invalid solar system ID');
//       setLoading(false);
//       return;
//     }
//     fetchKills();
//   }, [solarSystemID, fetchKills]);

//   useEffect(() => {
//     if (kills.length > 0) {
//       prepareKills();
//     }
//   }, [kills, prepareKills]);

//   useEffect(() => {
//     return () => {
//       cancelAllRequests();
//     };
//   }, [cancelAllRequests]);

//   // Пагинация
//   const paginatedKills = useMemo(
//     () => preparedKills.slice(page * itemsPerPage, (page + 1) * itemsPerPage),
//     [preparedKills, page]
//   );

//   // Компоненты
//   const ShipImage: React.FC<{ typeId: number; size?: number }> = ({ typeId, size = 32 }) => {
//     const [src, setSrc] = useState(
//       `https://images.evetech.net/types/${typeId}/render?size=${size}`
//     );

//     return (
//       <Image
//         src={src}
//         alt="Ship"
//         width={size}
//         height={size}
//         className={`w-${size} h-${size} rounded`}
//         onError={() => setSrc('/default-ship.png')}
//       />
//     );
//   };

//   const CorporationImage: React.FC<{ corporationId: number; size?: number }> = ({ corporationId, size = 32 }) => {
//     const [src, setSrc] = useState('/default-logo.png');

//     useEffect(() => {
//       const loadLogo = async () => {
//         if (cache.corporations[corporationId]?.data.logo) {
//           setSrc(cache.corporations[corporationId].data.logo);
//         } else {
//           const logo = await getCorporationLogo(corporationId);
//           setSrc(logo);
//         }
//       };

//       loadLogo();
//     }, [corporationId, cache.corporations, getCorporationLogo]);

//     return (
//       <Image
//         src={src}
//         alt="Corporation"
//         width={size}
//         height={size}
//         className={`w-${size} h-${size} rounded`}
//         onError={() => setSrc('/default-logo.png')}
//       />
//     );
//   };

//   const Row = React.memo(function Row({ kill }: { kill: PreparedKill }) {
//     return (
//       <tr key={kill.killmail_id} className="text-slate-300 ">
//         <td className="border border-slate-700 p-2 text-center">
//           <a
//             href={`https://zkillboard.com/kill/${kill.killmail_id}/`}
//             target="_blank"
//             rel="noopener noreferrer"
//             className="text-blue-400 hover:underline"
//           >
//             ZKB
//           </a>
//         </td>
//         <td className="border border-slate-700 p-2 text-center">
//           <div> 
//           {new Date(kill.killmail_time).toLocaleDateString()}
//           </div> 
//           <div className='text-bold text-red-500'>
//               {(() => {
//                 const daysAgo = Math.floor(
//                   (new Date().getTime() - new Date(kill.killmail_time).getTime()) /
//                     (1000 * 60 * 60 * 24)
//                 );
//                 return daysAgo === 0 ? ' (сегодня)' : ` (${daysAgo} дн. назад)`;
//               })()}
//           </div>
          
//         </td>
//         <td className="border border-slate-700 p-2">
//           <div className="flex items-center gap-2">
//           <div className="w-1/2 flex items-center gap-2"> 
//             <ShipImage typeId={kill.victim.ship_type_id} size={32} />
//               <div>
//                 <p>{kill.victim.ship_name}</p>
//               </div>
//           </div>
            
//             <div className="w-1/2 flex items-center gap-2">
//             <CorporationImage corporationId={kill.victim.corporation_id} size={32} />
//             <div>              
//               <p className="text-sm text-slate-500">{kill.victim.corporation_name}</p>
//               {kill.victim.alliance_name && (
//                 <p className="text-sm text-slate-500">{kill.victim.alliance_name}</p>
//               )}
//             </div>
//           </div>
//           </div>

          
//         </td>
//         <td className="border border-slate-700 p-2">
//           {kill.finalBlowAttacker ? (
//             <div className="flex items-center gap-2">
//               <div className="w-1/2 flex items-center gap-2"> 
//                 {kill.finalBlowAttacker.ship_type_id && (
//                   <ShipImage typeId={kill.finalBlowAttacker.ship_type_id} size={32} />
//                 )}
//                 <p>{kill.finalBlowAttacker.ship_name || 'Unknown Ship'}</p>
//               </div>
                            
//               <div className='w-1/2 flex items-center gap-2'>
//                 <CorporationImage corporationId={kill.finalBlowAttacker.corporation_id} size={32} />
//                 <div>
//                   <p className="text-sm text-slate-500">{kill.finalBlowAttacker.corporation_name}</p>
//                   {kill.finalBlowAttacker.alliance_name && (
//                     <p className="text-sm text-slate-500">{kill.finalBlowAttacker.alliance_name}</p>
//                   )}
//                 </div>
//               </div>
//             </div>
//           ) : (
//             <p>No final blow data</p>
//           )}
//         </td>
//       </tr>
//     );
//   });

//   // Состояния UI
//   if (loading && preparedKills.length === 0) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
//         <strong className="font-bold">Error: </strong>
//         <span className="block sm:inline">{error}</span>
//         <button 
//           onClick={() => {
//             setError(null);
//             fetchKills();
//           }}
//           className="absolute top-0 bottom-0 right-0 px-4 py-3"
//         >
//           <svg className="fill-current h-6 w-6 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
//             <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
//           </svg>
//         </button>
//       </div>
//     );
//   }

//   if (preparedKills.length === 0) {
//     return (
//       <div className="text-center py-8">
//         <p className="text-xl text-slate-400">No kill data available for this system</p>
//         <button
//           onClick={fetchKills}
//           className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
//         >
//           Retry
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="overflow-x-auto">
//       <div className="flex justify-between items-center mb-4">
//         {/* <h2 className="text-xl font-bold">Recent Ship Kills (Last {MAX_KILLS_TO_PROCESS}) in system: {solarSystemID}</h2> */}
//       </div>

//       <table className="w-full border-collapse border border-slate-700">
//         <thead>
//           <tr className="bg-slate-800 text-slate-300">
//             <th className="border border-slate-700 p-2">Сылка на ZKB</th>
//             <th className="border border-slate-700 p-2">Время кила</th>
//             <th className="border border-slate-700 p-2">Уничтоженный корабль</th>
//             <th className="border border-slate-700 p-2">Атакующая сторона</th>
//           </tr>
//         </thead>
//         <tbody>
//           {paginatedKills.map((kill) => (
//             <Row key={kill.killmail_id} kill={kill} />
//           ))}
//         </tbody>
//       </table>
//       <div className="flex gap-2 justify-center mt-4">
//           <button
//             onClick={() => setPage(prev => Math.max(prev - 1, 0))}
//             disabled={page === 0}
//             className="px-3 py-1 bg-slate-700 rounded disabled:opacity-50"
//           >
//             Previous
//           </button>
//           <span className="px-3 py-1">
//             Page {page + 1} of {Math.ceil(preparedKills.length / itemsPerPage)}
//           </span>
//           <button
//             onClick={() => setPage(prev => prev + 1)}
//             disabled={(page + 1) * itemsPerPage >= preparedKills.length}
//             className="px-3 py-1 bg-slate-700 rounded disabled:opacity-50"
//           >
//             Next
//           </button>
//         </div>
//     </div>
//   );
// };

// export default KilledShips;

