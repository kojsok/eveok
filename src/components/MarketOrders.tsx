"use client"
import { useState, useEffect } from "react";
import data from "@/data/typesnew.json";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface Item {
  id: number;
  name: {
    en: string | null;
    ru: string | null;
  };
}

interface Order {
  order_id: number;
  price: number;
  volume_remain: number;
  location_id: number;
  min_volume: number;
  is_buy_order: boolean;
  issued: string;
}

const REGIONS: Record<string, number> = {
  Jita: 10000002,
  Amarr: 10000043,
  Curse: 10000049,
  Domain: 10000032,
  Fountain: 10000028,
  Syndicate: 10000030,   // Нейтральный регион с высокой активностью
  Placid: 10000067,
  Cache: 10000048,
};

// const REGIONS: Record<string, number> = {
//   // Классические регионы низкой безопасности (0.0)
//   Delve: 10000043,       // Родной регион Амарр
//   Fountain: 10000028,
//   Querious: 10000059,    // Известен своими moon mining и PI
//   Syndicate: 10000030,   // Нейтральный регион с высокой активностью
//   Providence: 10000062, // Null-sec регион с интенсивной деятельностью

//   // Регионы высокой безопасности (High-Sec)
//   Jita: 10000002,        // Главный торговый хаб
//   Amarr: 10000043,       // Столичный регион Амарр
//   SinqLaison: 10000068, // Родной регион Минматар
//   Domain: 10000032,      // Родной регион Калдари
//   Heimatar: 10000031,    // Родной регион Галенте

//   // Null-Sec регионы
//   Fade: 10000057,
//   CloudRing: 10000001,  // Родной регион Калдари
//   Immensea: 10000034,
//   Metropolis: 10000033,  // Родной регион Галенте
//   Catch: 10000058,

//   // Low-Sec регионы
//   Placid: 10000067,
//   TheForge: 10000002,   // Включает в себя систему Jita
//   VergeVendor: 10000017,
//   Cache: 10000048,

//   // Фракционные войны
//   PureBlind: 10000060,
//   Detorid: 10000046,
//   Esoteria: 10000047,
//   Curse: 10000049,
// };

export default function MarketOrders() {
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [region, setRegion] = useState<number>(REGIONS.Jita);
  const [orders, setOrders] = useState<{ sell: Order[]; buy: Order[] }>({ sell: [], buy: [] });
  const [showDropdown, setShowDropdown] = useState(false);
  const [stationNames, setStationNames] = useState<Record<number, string>>({});

  // const fetchStationName = async (stationId: number) => {
  //   // if (stationId >= 60000000) return; // Пропускаем структуры
  //   if (stationNames[stationId]) return;
  //   const response = await fetch(`https://esi.evetech.net/latest/universe/stations/${stationId}/`);
  //   const data = await response.json();
  //   setStationNames((prev) => ({ ...prev, [stationId]: data.name }));
  // };


  const fetchStationName = async (stationId: number) => {
    if (stationNames[stationId]) return; // Уже загружена
  
    // Разделяем станции и структуры
    const isStructure = stationId > 1_000_000_000_000; 
  
    if (isStructure) {
      console.log(`🏢 ID ${stationId} - это структура, API ESI не поддерживает её.`);
      setStationNames((prev) => ({ ...prev, [stationId]: "Player Structure" }));
      return;
    }
  
    try {
      // console.log(`🔍 Получаем название станции ${stationId}`);
      const response = await fetch(`https://esi.evetech.net/latest/universe/stations/${stationId}/`);
  
      if (!response.ok) {
        // console.error(`❌ Ошибка запроса станции ${stationId}: ${response.statusText}`);
        setStationNames((prev) => ({ ...prev, [stationId]: "Unknown Station" }));
        return;
      }
  
      const data = await response.json();
      // console.log(`✅ Найдена станция: ${stationId} → ${data.name}`);
  
      setStationNames((prev) => ({ ...prev, [stationId]: data.name || "Unknown Station" }));
    } catch (error) {
      console.error("❌ Ошибка загрузки станции:", error);
      setStationNames((prev) => ({ ...prev, [stationId]: "Unknown Station" }));
    }
  };
  
  

  const filteredItems: Item[] = Object.values(data).filter((item: Item) => {
    const nameEn = item.name.en?.toLowerCase() || "";
    const nameRu = item.name.ru?.toLowerCase() || "";
    return search ? nameEn.includes(search.toLowerCase()) || nameRu.includes(search.toLowerCase()) : false;
  });

  // useEffect(() => {
  //   if (!selectedItem) return;
  //   fetch(`https://esi.evetech.net/latest/markets/${region}/orders/?type_id=${selectedItem.id}`)
  //     .then((res) => res.json())
  //     .then((data: Order[]) => {
  //       const sellOrders = data.filter((order) => !order.is_buy_order).sort((a, b) => a.price - b.price);
  //       const buyOrders = data.filter((order) => order.is_buy_order).sort((a, b) => b.price - a.price);
  //       setOrders({ sell: sellOrders, buy: buyOrders });
  //       sellOrders.concat(buyOrders).forEach((order) => fetchStationName(order.location_id));
  //     });
  // }, [selectedItem, region]);

  useEffect(() => {
    if (!selectedItem) return;
  
    const fetchOrders = async () => {
      try {
        const res = await fetch(
          `https://esi.evetech.net/latest/markets/${region}/orders/?type_id=${selectedItem.id}`
        );
  
        if (!res.ok) {
          console.error(`API error: ${res.status} ${res.statusText}`);
          return;
        }
  
        const data = await res.json();
  
        if (!Array.isArray(data)) {
          console.error("Unexpected API response:", data);
          return;
        }
  
        const sellOrders = data
          .filter((order) => !order.is_buy_order)
          .sort((a, b) => a.price - b.price);
        const buyOrders = data
          .filter((order) => order.is_buy_order)
          .sort((a, b) => b.price - a.price);
  
        setOrders({ sell: sellOrders, buy: buyOrders });
  
        sellOrders.concat(buyOrders).forEach((order) => {
          fetchStationName(order.location_id);
        });
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      }
    };
  
    fetchOrders();
  }, [selectedItem, region]);
  
  
  

  return (
    <div className="mx-auto p-4 w-full max-w-screen-xl bg-gradient-to-r from-[#04071D] via-[#04071D] to-[#0C0E23] border border-[rgba(105,113,162,0.16)] shadow-lg backdrop-blur-md transition-colors duration-300 rounded-lg text-slate-300">
      <h1 className="text-2xl font-bold mb-4 text-slate-300">Поиск предмета в маркете EVE Online</h1>
      <div className="flex gap-2 mb-2">
        <Input
          className="w-full max-w-screen-xl p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-800 text-slate-300"
          placeholder="Введите название предмета"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setShowDropdown(true);
          }}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          onKeyDown={(e) => {
            if (e.key === "Enter") setShowDropdown(false);
          }}
        />
        {/* <button className="px-4 py-2 bg-blue-500 text-white rounded-md">Поиск</button> */}
      </div>

      {showDropdown && filteredItems.length > 0 && (
        <div className="mt-2 border rounded-md max-h-60 overflow-y-auto bg-slate-800 text-slate-300">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="p-2 cursor-pointer hover:bg-gray-600"
              onClick={() => {
                setSelectedItem(item);
                setSearch(item.name.ru || item.name.en || "");
                setShowDropdown(false);
              }}
            >
              {item.name.ru || item.name.en}
            </div>
          ))}
        </div>
      )}

      {selectedItem && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold">{selectedItem.name.ru || selectedItem.name.en}</h2>
          <div className="mt-2 flex gap-4">
            {Object.entries(REGIONS).map(([name, id]) => (
              // <button
              //   key={id}
              //   className={`px-4 py-2 border rounded-md ${region === id ? "bg-blue-500 text-white" : ""}`}
              //   onClick={() => setRegion(id)}
              // >
              //   {name}
              // </button>
              <button
      key={id}
      className={`inline-flex gap-2 justify-center items-center w-48 px-3 py-2 text-sm font-medium tracking-tight leading-tight rounded-[10px] border border-[rgba(105,113,162,0.4)] ${region === id ? "bg-blue-500 text-white" : "bg-gradient-to-r from-[#161A31] to-[#06091F] text-white"} transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md hover:shadow-lg`}
      onClick={() => setRegion(id)}
    >
      {name}
    </button>
            ))}
          </div>

          {/* <Tabs defaultValue="sell" className="mt-4">
            <TabsList>
              <TabsTrigger value="sell">Sell Orders</TabsTrigger>
              <TabsTrigger value="buy">Buy Orders</TabsTrigger>
            </TabsList>

            <TabsContent value="sell">
              <OrderTable orders={orders.sell} stationNames={stationNames} />
            </TabsContent>
            <TabsContent value="buy">
              <OrderTable orders={orders.buy} stationNames={stationNames} />
            </TabsContent>
          </Tabs> */}
            <Tabs defaultValue="sell" className="w-full">
  <TabsList className="mt-8 inline-flex gap-2 justify-center items-center w-full bg-transparent">
    <TabsTrigger 
      value="sell" 
      className="inline-flex justify-center items-center w-48 px-4 py-2 text-sm font-medium text-white rounded-t-lg border border-transparent border-b-2 transition-colors duration-300 ease-in-out 
        data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:border-b-blue-500 hover:border-b-white"
    >
      Sell Orders
    </TabsTrigger>
    <TabsTrigger 
      value="buy" 
      className="inline-flex justify-center items-center w-48 px-4 py-2 text-sm font-medium text-white rounded-t-lg border border-transparent border-b-2 transition-colors duration-300 ease-in-out 
        data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:border-b-blue-500 hover:border-b-white"
    >
      Buy Orders
    </TabsTrigger>
  </TabsList>
  <TabsContent value="sell" className="mt-4">
    <OrderTable orders={orders.sell} stationNames={stationNames} />
  </TabsContent>
  <TabsContent value="buy" className="mt-4">
    <OrderTable orders={orders.buy} stationNames={stationNames} />
  </TabsContent>
</Tabs>
        </div>
      )}
      <div className="text-slate-300 mt-8">
                <p>Инструкция по поиску в марете в EVE Online:</p>
                <p className="text-slate-300">Введите названия предмета, будет отображена цена с возможностью проверки стоимости в разных регионах Eve online.</p>
                {/* <p className="text-slate-300">Необходимо вводить точное название предмета, например Tritanium или Cobalt.</p>
                <p className="mb-4 text-slate-300">Вы также можете скопировать все предметы в ангаре Ctrl+A(выделить) Ctrl+C(копировать) и Ctrl+V(вставить) в поле. На MacBook Command+A(выделить) Command+C(копировать) и Command+V вставить в поле.</p> */}
            </div>
    </div>
  );
}

function OrderTable({ orders, stationNames }: { orders: Order[]; stationNames: Record<number, string> }) {
  return (
    <div className="overflow-x-auto mt-4">
      <table className="min-w-full border-collapse text-slate-300">
        <thead className="bg-gray-700 text-white">
          <tr>
            <th className="p-2 text-center">Order</th>
            <th className="p-2 text-center">Станция</th>
            <th className="p-2 text-center">Цена (ISK)</th>
            <th className="p-2 text-center">Количество</th>
            <th className="p-2 text-center">Дата размещения</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.order_id} className="odd:bg-gray-800 even:bg-gray-900">
              <td className="p-2 text-center">{order.is_buy_order ? "Buy" : "Sell"}</td>
              <td className="p-2 text-center">{stationNames[order.location_id] || "Loading..."}</td>
              <td className="p-2 text-center">{order.price.toLocaleString()} ISK</td>
              <td className="p-2 text-center">{order.volume_remain}</td>
               {/* <td className="p-2 text-center">{order.min_volume}</td> */}
              <td className="p-2 text-center">{new Date(order.issued).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })} {new Date(order.issued).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" })}</td>
            </tr>
          ))}
        </tbody>
      </table>

      
    </div>
  );
}



// import { useState, useEffect } from "react";
// import data from "@/data/typesnew.json";
// import { Input } from "@/components/ui/input";
// import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// interface Item {
//   id: number;
//   name: {
//     en: string | null;
//     ru: string | null;
//   };
// }

// interface Order {
//   order_id: number;
//   price: number;
//   volume_remain: number;
//   location_id: number;
//   min_volume: number;
//   is_buy_order: boolean;
//   issued: string;
// }

// const REGIONS: Record<string, number> = {
//   Jita: 10000002,
//   Amarr: 10000043,
// };

// export default function MarketOrders() {
//   const [search, setSearch] = useState("");
//   const [selectedItem, setSelectedItem] = useState<Item | null>(null);
//   const [region, setRegion] = useState<number>(REGIONS.Jita);
//   const [orders, setOrders] = useState<{ sell: Order[]; buy: Order[] }>({ sell: [], buy: [] });
//   const [showDropdown, setShowDropdown] = useState(false);

//   const filteredItems: Item[] = Object.values(data).filter((item: Item) => {
//     const nameEn = item.name.en?.toLowerCase() || "";
//     const nameRu = item.name.ru?.toLowerCase() || "";
//     return search ? nameEn.includes(search.toLowerCase()) || nameRu.includes(search.toLowerCase()) : false;
//   });

//   useEffect(() => {
//     if (!selectedItem) return;
//     fetch(`https://esi.evetech.net/latest/markets/${region}/orders/?type_id=${selectedItem.id}`)
//       .then((res) => res.json())
//       .then((data: Order[]) => {
//         const sellOrders = data.filter((order) => !order.is_buy_order).sort((a, b) => a.price - b.price);
//         const buyOrders = data.filter((order) => order.is_buy_order).sort((a, b) => b.price - a.price);
//         setOrders({ sell: sellOrders, buy: buyOrders });
//       });
//   }, [selectedItem, region]);

//   return (
//     <div className="mx-auto p-4 max-w-screen-xl bg-gradient-to-r from-[#04071D] via-[#04071D] to-[#0C0E23] border border-[rgba(105,113,162,0.16)] shadow-lg backdrop-blur-md transition-colors duration-300 rounded-lg text-slate-300">
//       <h1 className="text-2xl font-bold mb-4 text-slate-300">Проверка цен предметов EVE Online</h1>
//       <div className="flex mx-auto max-w-screen-xl gap-2 mb-2">
      
//         <Input
//           className="w-full p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-800 text-slate-300"
//           placeholder="Введите название предмета"
//           value={search}
//           onChange={(e) => {
//             setSearch(e.target.value);
//             setShowDropdown(true);
//           }}
//           onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
//           onKeyDown={(e) => {
//             if (e.key === "Enter") setShowDropdown(false);
//           }}
//         />
//         <button className="px-4 py-2 bg-blue-500 text-white rounded-md">Поиск</button>
//       </div>

//       {showDropdown && filteredItems.length > 0 && (
//         <div className="mt-2 border rounded-md max-h-60 overflow-y-auto bg-slate-800 text-slate-300">
//           {filteredItems.map((item) => (
//             <div
//               key={item.id}
//               className="p-2 cursor-pointer hover:bg-gray-600"
//               onClick={() => {
//                 setSelectedItem(item);
//                 setSearch(item.name.ru || item.name.en || "");
//                 setShowDropdown(false);
//               }}
//             >
//               {item.name.ru || item.name.en}
//             </div>
//           ))}
//         </div>
//       )}

//       {selectedItem && (
//         <div className="mt-4">
//           <h2 className="text-lg font-semibold">{selectedItem.name.ru || selectedItem.name.en}</h2>
//           <div className="mt-2 flex gap-4">
//             {Object.entries(REGIONS).map(([name, id]) => (
//               <button
//                 key={id}
//                 className={`px-4 py-2 border rounded-md ${region === id ? "bg-blue-500 text-white" : ""}`}
//                 onClick={() => setRegion(id)}
//               >
//                 {name}
//               </button>
//             ))}
//           </div>

//           <Tabs defaultValue="sell" className="mt-4">
//             <TabsList>
//               <TabsTrigger value="sell">Sell Orders</TabsTrigger>
//               <TabsTrigger value="buy">Buy Orders</TabsTrigger>
//             </TabsList>

//             <TabsContent value="sell">
//               <OrderTable orders={orders.sell} />
//             </TabsContent>
//             <TabsContent value="buy">
//               <OrderTable orders={orders.buy} />
//             </TabsContent>
//           </Tabs>
//         </div>
//       )}
//     </div>
//   );
// } 

// function OrderTable({ orders }: { orders: Order[] }) {
//   return (
//     <div className="overflow-x-auto mt-4">
//       <table className="min-w-full border-collapse text-slate-300">
//         <thead className="bg-gray-700 text-white">
//           <tr>
//             <th className="p-2 text-center">Region</th>
//             <th className="p-2 text-center">Station</th>
//             <th className="p-2 text-center">Price (ISK)</th>
//             <th className="p-2 text-center">Quantity</th>
//             <th className="p-2 text-center">Min. qty</th>
//             <th className="p-2 text-center">Expires</th>
//             <th className="p-2 text-center">First seen</th>
//           </tr>
//         </thead>
//         <tbody>
//           {orders.map((order) => (
//             <tr key={order.order_id} className="odd:bg-gray-800 even:bg-gray-900">
//               <td className="p-2 text-center">{order.is_buy_order ? "Buy" : "Sell"}</td>
//               <td className="p-2 text-center">{order.location_id}</td>
//               <td className="p-2 text-center">{order.price.toLocaleString()} ISK</td>
//               <td className="p-2 text-center">{order.volume_remain}</td>
//               <td className="p-2 text-center">{order.min_volume}</td>
//               <td className="p-2 text-center">-</td>
//               <td className="p-2 text-center">{new Date(order.issued).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })} {new Date(order.issued).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" })}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }



// import { useState, useEffect } from "react";
// import data from "@/data/typesnew.json";
// import { Input } from "@/components/ui/input";
// import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// interface Item {
//   id: number;
//   name: {
//     en: string | null;
//     ru: string | null;
//   };
// }

// interface Order {
//   order_id: number;
//   price: number;
//   volume_remain: number;
//   location_id: number;
//   min_volume: number;
//   is_buy_order: boolean;
//   issued: string;
// }

// const REGIONS: Record<string, number> = {
//   Jita: 10000002,
//   Amarr: 10000043,
// };

// export default function MarketOrders() {
//   const [search, setSearch] = useState("");
//   const [selectedItem, setSelectedItem] = useState<Item | null>(null);
//   const [region, setRegion] = useState<number>(REGIONS.Jita);
//   const [orders, setOrders] = useState<{ sell: Order[]; buy: Order[] }>({ sell: [], buy: [] });
//   const [showDropdown, setShowDropdown] = useState(false);

//   const filteredItems: Item[] = Object.values(data).filter((item: Item) => {
//     const nameEn = item.name.en?.toLowerCase() || "";
//     const nameRu = item.name.ru?.toLowerCase() || "";
//     return search ? nameEn.includes(search.toLowerCase()) || nameRu.includes(search.toLowerCase()) : false;
//   });

//   useEffect(() => {
//     if (!selectedItem) return;
//     fetch(`https://esi.evetech.net/latest/markets/${region}/orders/?type_id=${selectedItem.id}`)
//       .then((res) => res.json())
//       .then((data: Order[]) => {
//         const sellOrders = data.filter((order) => !order.is_buy_order).sort((a, b) => a.price - b.price);
//         const buyOrders = data.filter((order) => order.is_buy_order).sort((a, b) => b.price - a.price);
//         setOrders({ sell: sellOrders, buy: buyOrders });
//       });
//   }, [selectedItem, region]);

//   return (
//     <div className="mx-auto p-4 max-md:px-5 bg-gradient-to-r from-[#04071D] via-[#04071D] to-[#0C0E23] border border-[rgba(105,113,162,0.16)] shadow-lg backdrop-blur-md transition-colors duration-300 rounded-lg text-slate-300">
//       <div className="flex gap-2 mb-2">
//         <Input
//           className="w-full p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-800 text-slate-300"
//           placeholder="Введите название предмета"
//           value={search}
//           onChange={(e) => {
//             setSearch(e.target.value);
//             setShowDropdown(true);
//           }}
//           onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
//           onKeyDown={(e) => {
//             if (e.key === "Enter") setShowDropdown(false);
//           }}
//         />
//         <button className="px-4 py-2 bg-blue-500 text-white rounded-md">Поиск</button>
//       </div>

//       {showDropdown && filteredItems.length > 0 && (
//         <div className="mt-2 border rounded-md max-h-60 overflow-y-auto bg-slate-800 text-slate-300">
//           {filteredItems.map((item) => (
//             <div
//               key={item.id}
//               className="p-2 cursor-pointer hover:bg-gray-600"
//               onClick={() => {
//                 setSelectedItem(item);
//                 setSearch(item.name.ru || item.name.en || "");
//                 setShowDropdown(false);
//               }}
//             >
//               {item.name.ru || item.name.en}
//             </div>
//           ))}
//         </div>
//       )}

//       {selectedItem && (
//         <div className="mt-4">
//           <h2 className="text-lg font-semibold">{selectedItem.name.ru || selectedItem.name.en}</h2>
//           <div className="mt-2 flex gap-4">
//             {Object.entries(REGIONS).map(([name, id]) => (
//               <button
//                 key={id}
//                 className={`px-4 py-2 border rounded-md ${region === id ? "bg-blue-500 text-white" : ""}`}
//                 onClick={() => setRegion(id)}
//               >
//                 {name}
//               </button>
//             ))}
//           </div>

//           <Tabs defaultValue="sell" className="mt-4">
//             <TabsList>
//               <TabsTrigger value="sell">Sell Orders</TabsTrigger>
//               <TabsTrigger value="buy">Buy Orders</TabsTrigger>
//             </TabsList>

//             <TabsContent value="sell">
//               <OrderTable orders={orders.sell} />
//             </TabsContent>
//             <TabsContent value="buy">
//               <OrderTable orders={orders.buy} />
//             </TabsContent>
//           </Tabs>
//         </div>
//       )}
//     </div>
//   );
// }

// function OrderTable({ orders }: { orders: Order[] }) {
//   return (
//     <div className="overflow-x-auto mt-4">
//       <table className="min-w-full border-collapse text-slate-300">
//         <thead className="bg-gray-700 text-white">
//           <tr>
//             <th className="p-2 text-center">Region</th>
//             <th className="p-2 text-center">Station</th>
//             <th className="p-2 text-center">Price (ISK)</th>
//             <th className="p-2 text-center">Quantity</th>
//             <th className="p-2 text-center">Min. qty</th>
//             <th className="p-2 text-center">Expires</th>
//             <th className="p-2 text-center">First seen</th>
//           </tr>
//         </thead>
//         <tbody>
//           {orders.map((order) => (
//             <tr key={order.order_id} className="odd:bg-gray-800 even:bg-gray-900">
//               <td className="p-2 text-center">{order.is_buy_order ? "Buy" : "Sell"}</td>
//               <td className="p-2 text-center">{order.location_id}</td>
//               <td className="p-2 text-center">{order.price.toLocaleString()} ISK</td>
//               <td className="p-2 text-center">{order.volume_remain}</td>
//               <td className="p-2 text-center">{order.min_volume}</td>
//               <td className="p-2 text-center">-</td>
//               <td className="p-2 text-center">{new Date(order.issued).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })} {new Date(order.issued).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" })}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }

// import { useState, useEffect } from "react";
// import data from "@/data/typesnew.json";
// import { Input } from "@/components/ui/input";
// import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// interface Item {
//   id: number;
//   name: {
//     en: string | null;
//     ru: string | null;
//   };
// }

// interface Order {
//   order_id: number;
//   price: number;
//   volume_remain: number;
//   location_id: number;
//   min_volume: number;
//   is_buy_order: boolean;
//   issued: string;
// }

// const REGIONS: Record<string, number> = {
//   Jita: 10000002,
//   Amarr: 10000043,
// };

// export default function MarketOrders() {
//   const [search, setSearch] = useState("");
//   const [selectedItem, setSelectedItem] = useState<Item | null>(null);
//   const [region, setRegion] = useState<number>(REGIONS.Jita);
//   const [orders, setOrders] = useState<{ sell: Order[]; buy: Order[] }>({ sell: [], buy: [] });
//   const [showDropdown, setShowDropdown] = useState(false);

//   const filteredItems: Item[] = Object.values(data).filter((item: Item) => {
//     const nameEn = item.name.en?.toLowerCase() || "";
//     const nameRu = item.name.ru?.toLowerCase() || "";
//     return search ? nameEn.includes(search.toLowerCase()) || nameRu.includes(search.toLowerCase()) : false;
//   });

//   useEffect(() => {
//     if (!selectedItem) return;
//     fetch(`https://esi.evetech.net/latest/markets/${region}/orders/?type_id=${selectedItem.id}`)
//       .then((res) => res.json())
//       .then((data: Order[]) => {
//         const sellOrders = data.filter((order) => !order.is_buy_order).sort((a, b) => a.price - b.price);
//         const buyOrders = data.filter((order) => order.is_buy_order).sort((a, b) => b.price - a.price);
//         setOrders({ sell: sellOrders, buy: buyOrders });
//       });
//   }, [selectedItem, region]);

//   return (
//     <div className="mx-auto p-4 max-md:px-5 bg-gradient-to-r from-[#04071D] via-[#04071D] to-[#0C0E23] border border-[rgba(105,113,162,0.16)] shadow-lg backdrop-blur-md transition-colors duration-300 rounded-lg text-slate-300">
//       <Input
//         className="w-full  p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-800 text-slate-300"
//         placeholder="Введите название предмета"
//         value={search}
//         onChange={(e) => {
//           setSearch(e.target.value);
//           setShowDropdown(true);
//         }}
//         onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
//         onKeyDown={(e) => {
//           if (e.key === "Enter") setShowDropdown(false);
//         }}
//       />

//       {showDropdown && filteredItems.length > 0 && (
//         <div className="mt-2 border rounded-md max-h-60 overflow-y-auto bg-slate-800 text-slate-300">
//           {filteredItems.map((item) => (
//             <div
//               key={item.id}
//               className="p-2 cursor-pointer hover:bg-gray-600"
//               onClick={() => {
//                 setSelectedItem(item);
//                 setSearch(item.name.ru || item.name.en || "");
//                 setShowDropdown(false);
//               }}
//             >
//               {item.name.ru || item.name.en}
//             </div>
//           ))}
//         </div>
//       )}

//       {selectedItem && (
//         <div className="mt-4">
//           <h2 className="text-lg font-semibold">{selectedItem.name.ru || selectedItem.name.en}</h2>
//           <div className="mt-2 flex gap-4">
//             {Object.entries(REGIONS).map(([name, id]) => (
//               <button
//                 key={id}
//                 className={`px-4 py-2 border rounded-md ${region === id ? "bg-blue-500 text-white" : ""}`}
//                 onClick={() => setRegion(id)}
//               >
//                 {name}
//               </button>
//             ))}
//           </div>

//           <Tabs defaultValue="sell" className="mt-4">
//             <TabsList>
//               <TabsTrigger value="sell">Sell Orders</TabsTrigger>
//               <TabsTrigger value="buy">Buy Orders</TabsTrigger>
//             </TabsList>

//             <TabsContent value="sell">
//               <OrderTable orders={orders.sell} />
//             </TabsContent>
//             <TabsContent value="buy">
//               <OrderTable orders={orders.buy} />
//             </TabsContent>
//           </Tabs>
//         </div>
//       )}
//     </div>
//   );
// }

// function OrderTable({ orders }: { orders: Order[] }) {
//   return (
//     <div className="overflow-x-auto mt-4">
//       <table className="min-w-full border-collapse text-slate-300">
//         <thead className="bg-gray-700 text-white">
//           <tr>
//             <th className="p-2 text-center">Region</th>
//             <th className="p-2 text-center">Station</th>
//             <th className="p-2 text-center">Price (ISK)</th>
//             <th className="p-2 text-center">Quantity</th>
//             <th className="p-2 text-center">Min. qty</th>
//             <th className="p-2 text-center">Expires</th>
//             <th className="p-2 text-center">First seen</th>
//           </tr>
//         </thead>
//         <tbody>
//           {orders.map((order) => (
//             <tr key={order.order_id} className="odd:bg-gray-800 even:bg-gray-900">
//               <td className="p-2 text-center">{order.is_buy_order ? "Buy" : "Sell"}</td>
//               <td className="p-2 text-center">{order.location_id}</td>
//               <td className="p-2 text-center">{order.price.toLocaleString()} ISK</td>
//               <td className="p-2 text-center">{order.volume_remain}</td>
//               <td className="p-2 text-center">{order.min_volume}</td>
//               <td className="p-2 text-center">-</td>
//               <td className="p-2 text-center">{new Date(order.issued).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })} {new Date(order.issued).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" })}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }


// import { useState, useEffect } from "react";
// import data from "@/data/typesnew.json";
// import { Input } from "@/components/ui/input";
// import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// interface Item {
//   id: number;
//   name: {
//     en: string | null;
//     ru: string | null;
//   };
// }

// interface Order {
//   order_id: number;
//   price: number;
//   volume_remain: number;
//   location_id: number;
//   min_volume: number;
//   is_buy_order: boolean;
//   issued: string;
// }

// const REGIONS: Record<string, number> = {
//   Jita: 10000002,
//   Amarr: 10000043,
// };

// export default function MarketOrders() {
//   const [search, setSearch] = useState("");
//   const [selectedItem, setSelectedItem] = useState<Item | null>(null);
//   const [region, setRegion] = useState<number>(REGIONS.Jita);
//   const [orders, setOrders] = useState<{ sell: Order[]; buy: Order[] }>({ sell: [], buy: [] });
//   const [showDropdown, setShowDropdown] = useState(false);

//   const filteredItems: Item[] = Object.values(data).filter((item: Item) => {
//     const nameEn = item.name.en?.toLowerCase() || "";
//     const nameRu = item.name.ru?.toLowerCase() || "";
//     return search ? nameEn.includes(search.toLowerCase()) || nameRu.includes(search.toLowerCase()) : false;
//   });

//   useEffect(() => {
//     if (!selectedItem) return;
//     fetch(`https://esi.evetech.net/latest/markets/${region}/orders/?type_id=${selectedItem.id}`)
//       .then((res) => res.json())
//       .then((data: Order[]) => {
//         const sellOrders = data.filter((order) => !order.is_buy_order).sort((a, b) => a.price - b.price);
//         const buyOrders = data.filter((order) => order.is_buy_order).sort((a, b) => b.price - a.price);
//         setOrders({ sell: sellOrders, buy: buyOrders });
//       });
//   }, [selectedItem, region]);

//   return (
//     <div className="mx-auto p-4 max-md:px-5 bg-gradient-to-r from-[#04071D] via-[#04071D] to-[#0C0E23] border border-[rgba(105,113,162,0.16)] shadow-lg backdrop-blur-md transition-colors duration-300 rounded-lg text-slate-300">
//       <Input
//         className="w-full p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-800 text-slate-300"
//         placeholder="Введите название предмета"
//         value={search}
//         onChange={(e) => {
//           setSearch(e.target.value);
//           setShowDropdown(true);
//         }}
//         onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
//         onKeyDown={(e) => {
//           if (e.key === "Enter") setShowDropdown(false);
//         }}
//       />

//       {showDropdown && filteredItems.length > 0 && (
//         <div className="mt-2 border rounded-md max-h-60 overflow-y-auto bg-slate-800 text-slate-300">
//           {filteredItems.map((item) => (
//             <div
//               key={item.id}
//               className="p-2 cursor-pointer hover:bg-gray-600"
//               onClick={() => {
//                 setSelectedItem(item);
//                 setSearch(item.name.ru || item.name.en || "");
//                 setShowDropdown(false);
//               }}
//             >
//               {item.name.ru || item.name.en}
//             </div>
//           ))}
//         </div>
//       )}

//       {selectedItem && (
//         <div className="mt-4">
//           <h2 className="text-lg font-semibold">{selectedItem.name.ru || selectedItem.name.en}</h2>
//           <div className="mt-2 flex gap-4">
//             {Object.entries(REGIONS).map(([name, id]) => (
//               <button
//                 key={id}
//                 className={`px-4 py-2 border rounded-md ${region === id ? "bg-blue-500 text-white" : ""}`}
//                 onClick={() => setRegion(id)}
//               >
//                 {name}
//               </button>
//             ))}
//           </div>

//           <Tabs defaultValue="sell" className="mt-4">
//             <TabsList>
//               <TabsTrigger value="sell">Sell Orders</TabsTrigger>
//               <TabsTrigger value="buy">Buy Orders</TabsTrigger>
//             </TabsList>

//             <TabsContent value="sell">
//               <OrderTable orders={orders.sell} />
//             </TabsContent>
//             <TabsContent value="buy">
//               <OrderTable orders={orders.buy} />
//             </TabsContent>
//           </Tabs>
//         </div>
//       )}
//     </div>
//   );
// }

// function OrderTable({ orders }: { orders: Order[] }) {
//   return (
//     <div className="overflow-x-auto mt-4">
//       <table className="min-w-full border-collapse text-slate-300">
//         <thead className="bg-gray-700 text-white">
//           <tr>
//             <th className="p-2 text-center">Region</th>
//             <th className="p-2 text-center">Station</th>
//             <th className="p-2 text-center">Price (ISK)</th>
//             <th className="p-2 text-center">Quantity</th>
//             <th className="p-2 text-center">Min. qty</th>
//             <th className="p-2 text-center">Expires</th>
//             <th className="p-2 text-center">First seen</th>
//           </tr>
//         </thead>
//         <tbody>
//           {orders.map((order) => (
//             <tr key={order.order_id} className="odd:bg-gray-800 even:bg-gray-900">
//               <td className="p-2 text-center">{order.is_buy_order ? "Buy" : "Sell"}</td>
//               <td className="p-2 text-center">{order.location_id}</td>
//               <td className="p-2 text-center">{order.price.toLocaleString()} ISK</td>
//               <td className="p-2 text-center">{order.volume_remain}</td>
//               <td className="p-2 text-center">{order.min_volume}</td>
//               <td className="p-2 text-center">-</td>
//               <td className="p-2 text-center">{new Date(order.issued).toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// } 


// import { useState, useEffect } from "react";
// import data from "@/data/typesnew.json";
// import { Input } from "@/components/ui/input";
// import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
// import { Card, CardContent } from "@/components/ui/card";

// interface Item {
//   id: number;
//   name: {
//     en: string | null;
//     ru: string | null;
//   };
// }

// interface Order {
//   order_id: number;
//   price: number;
//   volume_remain: number;
//   location_id: number;
//   min_volume: number;
//   is_buy_order: boolean;
//   issued: string;
// }

// const REGIONS: Record<string, number> = {
//   Jita: 10000002,
//   Amarr: 10000043,
// };

// export default function MarketOrders() {
//   const [search, setSearch] = useState("");
//   const [selectedItem, setSelectedItem] = useState<Item | null>(null);
//   const [region, setRegion] = useState<number>(REGIONS.Jita);
//   const [orders, setOrders] = useState<{ sell: Order[]; buy: Order[] }>({ sell: [], buy: [] });
//   const [showDropdown, setShowDropdown] = useState(false);

//   const filteredItems: Item[] = Object.values(data).filter((item: Item) => {
//     const nameEn = item.name.en?.toLowerCase() || "";
//     const nameRu = item.name.ru?.toLowerCase() || "";
//     return search ? nameEn.includes(search.toLowerCase()) || nameRu.includes(search.toLowerCase()) : false;
//   });

//   useEffect(() => {
//     if (!selectedItem) return;
//     fetch(`https://esi.evetech.net/latest/markets/${region}/orders/?type_id=${selectedItem.id}`)
//       .then((res) => res.json())
//       .then((data: Order[]) => {
//         const sellOrders = data.filter((order) => !order.is_buy_order).sort((a, b) => a.price - b.price);
//         const buyOrders = data.filter((order) => order.is_buy_order).sort((a, b) => b.price - a.price);
//         setOrders({ sell: sellOrders, buy: buyOrders });
//       });
//   }, [selectedItem, region]);

//   return (
//     <div className="mx-auto p-4 max-md:px-5 bg-gradient-to-r from-[#04071D] via-[#04071D] to-[#0C0E23] border border-[rgba(105,113,162,0.16)] shadow-lg backdrop-blur-md transition-colors duration-300 rounded-lg text-slate-300">
//       <Input
//         className="w-full p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-800 text-slate-300"
//         placeholder="Введите название предмета"
//         value={search}
//         onChange={(e) => {
//           setSearch(e.target.value);
//           setShowDropdown(true);
//         }}
//         onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
//         onKeyDown={(e) => {
//           if (e.key === "Enter") setShowDropdown(false);
//         }}
//       />

//       {showDropdown && filteredItems.length > 0 && (
//         <div className="mt-2 border rounded-md max-h-60 overflow-y-auto bg-slate-800 text-slate-300">
//           {filteredItems.map((item) => (
//             <div
//               key={item.id}
//               className="p-2 cursor-pointer hover:bg-gray-600"
//               onClick={() => {
//                 setSelectedItem(item);
//                 setSearch(item.name.ru || item.name.en || "");
//                 setShowDropdown(false);
//               }}
//             >
//               {item.name.ru || item.name.en}
//             </div>
//           ))}
//         </div>
//       )}

//       {selectedItem && (
//         <div className="mt-4">
//           <h2 className="text-lg font-semibold">{selectedItem.name.ru || selectedItem.name.en}</h2>
//           <div className="mt-2 flex gap-4">
//             {Object.entries(REGIONS).map(([name, id]) => (
//               <button
//                 key={id}
//                 className={`px-4 py-2 border rounded-md ${region === id ? "bg-blue-500 text-white" : ""}`}
//                 onClick={() => setRegion(id)}
//               >
//                 {name}
//               </button>
//             ))}
//           </div>

//           <Tabs defaultValue="sell" className="mt-4">
//             <TabsList>
//               <TabsTrigger value="sell">Sell Orders</TabsTrigger>
//               <TabsTrigger value="buy">Buy Orders</TabsTrigger>
//             </TabsList>

//             <TabsContent value="sell">
//               <OrderTable orders={orders.sell} />
//             </TabsContent>
//             <TabsContent value="buy">
//               <OrderTable orders={orders.buy} />
//             </TabsContent>
//           </Tabs>
//         </div>
//       )}
//     </div>
//   );
// }

// function OrderTable({ orders }: { orders: Order[] }) {
//   return (
//     <Card>
//       <CardContent>
//         {orders.length === 0 ? (
//           <p>Нет данных</p>
//         ) : (
//           <div className="overflow-x-auto mt-4">
//             <table className="min-w-full border-collapse text-slate-300">
//               <thead className="bg-gray-700 text-white">
//                 <tr>
//                   <th className="p-2 text-center">Region</th>
//                   <th className="p-2 text-center">Station</th>
//                   <th className="p-2 text-center">Price (ISK)</th>
//                   <th className="p-2 text-center">Quantity</th>
//                   <th className="p-2 text-center">Min. qty</th>
//                   <th className="p-2 text-center">Expires</th>
//                   <th className="p-2 text-center">First seen</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {orders.map((order) => (
//                   <tr key={order.order_id} className="odd:bg-gray-800 even:bg-gray-900">
//                     <td className="p-2 text-center">{order.is_buy_order ? "Buy" : "Sell"}</td>
//                     <td className="p-2 text-center">{order.location_id}</td>
//                     <td className="p-2 text-center">{order.price.toLocaleString()} ISK</td>
//                     <td className="p-2 text-center">{order.volume_remain}</td>
//                     <td className="p-2 text-center">{order.min_volume}</td>
//                     <td className="p-2 text-center">-</td>
//                     <td className="p-2 text-center">{order.issued}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   );
// }




// import { useState, useEffect } from "react";
// import data from "@/data/typesnew.json";
// import { Input } from "@/components/ui/input";
// import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
// import { Card, CardContent } from "@/components/ui/card";

// interface Item {
//   id: number;
//   name: {
//     en: string | null;
//     ru: string | null;
//   };
// }

// interface Order {
//   order_id: number;
//   price: number;
//   volume_remain: number;
//   location_id: number;
//   min_volume: number;
//   is_buy_order: boolean;
//   issued: string;
// }

// const REGIONS: Record<string, number> = {
//   Jita: 10000002,
//   Amarr: 10000043,
// };

// export default function MarketOrders() {
//   const [search, setSearch] = useState("");
//   const [selectedItem, setSelectedItem] = useState<Item | null>(null);
//   const [region, setRegion] = useState<number>(REGIONS.Jita);
//   const [orders, setOrders] = useState<{ sell: Order[]; buy: Order[] }>({ sell: [], buy: [] });
//   const [showDropdown, setShowDropdown] = useState(false);

//   // Поиск по русскому и английскому названию
//   const filteredItems: Item[] = Object.values(data).filter((item: Item) => {
//     const nameEn = item.name.en?.toLowerCase() || "";
//     const nameRu = item.name.ru?.toLowerCase() || "";
//     return search ? nameEn.includes(search.toLowerCase()) || nameRu.includes(search.toLowerCase()) : false;
//   });

//   // Загрузка ордеров при выборе предмета
//   useEffect(() => {
//     if (!selectedItem) return;
//     fetch(`https://esi.evetech.net/latest/markets/${region}/orders/?type_id=${selectedItem.id}`)
//       .then((res) => res.json())
//       .then((data: Order[]) => {
//         const sellOrders = data.filter((order) => !order.is_buy_order).sort((a, b) => a.price - b.price);
//         const buyOrders = data.filter((order) => order.is_buy_order).sort((a, b) => b.price - a.price);
//         setOrders({ sell: sellOrders, buy: buyOrders });
//       });
//   }, [selectedItem, region]);

//   return (
//     <div className="mx-auto p-4 max-md:px-5 bg-gradient-to-r from-[#04071D] via-[#04071D] to-[#0C0E23] border border-[rgba(105,113,162,0.16)] shadow-lg backdrop-blur-md transition-colors duration-300 rounded-lg text-slate-300">
//       <Input
//         placeholder="Введите название предмета"
//         value={search}
//         onChange={(e) => {
//           setSearch(e.target.value);
//           setShowDropdown(true);
//         }}
//         onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
//         onKeyDown={(e) => {
//           if (e.key === "Enter") setShowDropdown(false);
//         }}
//       />

//       {showDropdown && filteredItems.length > 0 && (
//         <div className="mt-2 border rounded-md max-h-60 overflow-y-auto">
//           {filteredItems.map((item) => (
//             <div
//               key={item.id}
//               className="p-2 cursor-pointer hover:bg-gray-200"
//               onClick={() => {
//                 setSelectedItem(item);
//                 setSearch(item.name.ru || item.name.en || "");
//                 setShowDropdown(false);
//               }}
//             >
//               {item.name.ru || item.name.en}
//             </div>
//           ))}
//         </div>
//       )}

//       {selectedItem && (
//         <div className="mt-4">
//           <h2 className="text-lg font-semibold">{selectedItem.name.ru || selectedItem.name.en}</h2>
//           <div className="mt-2 flex gap-4">
//             {Object.entries(REGIONS).map(([name, id]) => (
//               <button
//                 key={id}
//                 className={`px-4 py-2 border rounded-md ${region === id ? "bg-blue-500 text-white" : ""}`}
//                 onClick={() => setRegion(id)}
//               >
//                 {name}
//               </button>
//             ))}
//           </div>

//           <Tabs defaultValue="sell" className="mt-4">
//             <TabsList>
//               <TabsTrigger value="sell">Sell Orders</TabsTrigger>
//               <TabsTrigger value="buy">Buy Orders</TabsTrigger>
//             </TabsList>

//             <TabsContent value="sell">
//               <OrderTable orders={orders.sell} />
//             </TabsContent>
//             <TabsContent value="buy">
//               <OrderTable orders={orders.buy} />
//             </TabsContent>
//           </Tabs>
//         </div>
//       )}
//     </div>
//   );
// }

// function OrderTable({ orders }: { orders: Order[] }) {
//   return (
//     <Card>
//       <CardContent>
//         {orders.length === 0 ? (
//           <p>Нет данных</p>
//         ) : (
//           <table className="w-full border-collapse border mt-2 text-slate-300">
//             <thead>
//               <tr className="bg-gray-700 text-white">
//                 <th className="border p-2">Region</th>
//                 <th className="border p-2">Station</th>
//                 <th className="border p-2">Price (ISK)</th>
//                 <th className="border p-2">Quantity</th>
//                 <th className="border p-2">Min. qty</th>
//                 <th className="border p-2">Expires</th>
//                 <th className="border p-2">First seen</th>
//               </tr>
//             </thead>
//             <tbody>
//               {orders.map((order) => (
//                 <tr key={order.order_id}>
//                   <td className="border p-2">{order.is_buy_order ? "Buy" : "Sell"}</td>
//                   <td className="border p-2">{order.location_id}</td>
//                   <td className="border p-2">{order.price.toLocaleString()} ISK</td>
//                   <td className="border p-2">{order.volume_remain}</td>
//                   <td className="border p-2">{order.min_volume}</td>
//                   <td className="border p-2">-</td>
//                   <td className="border p-2">{order.issued}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         )}
//       </CardContent>
//     </Card>
//   );
// }


// import { useState, useEffect } from "react";
// import data from "@/data/typesnew.json";
// import { Input } from "@/components/ui/input";
// import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
// import { Card, CardContent } from "@/components/ui/card";

// interface Item {
//   id: number;
//   name: {
//     en: string | null;
//     ru: string | null;
//   };
// }

// interface Order {
//   order_id: number;
//   price: number;
//   volume_remain: number;
//   min_volume: number;
//   location_id: number;
//   is_buy_order: boolean;
//   issued: string;
// }

// const REGIONS: Record<string, number> = {
//   Jita: 10000002,
//   Amarr: 10000043,
// };

// export default function MarketOrders() {
//   const [search, setSearch] = useState("");
//   const [selectedItem, setSelectedItem] = useState<Item | null>(null);
//   const [region, setRegion] = useState<number>(REGIONS.Jita);
//   const [orders, setOrders] = useState<{ sell: Order[]; buy: Order[] }>({ sell: [], buy: [] });

//   const filteredItems: Item[] = Object.values(data).filter((item: Item) => {
//     const nameEn = item.name.en?.toLowerCase() || "";
//     const nameRu = item.name.ru?.toLowerCase() || "";
//     return search ? nameEn.includes(search.toLowerCase()) || nameRu.includes(search.toLowerCase()) : false;
//   });

//   useEffect(() => {
//     if (!selectedItem) return;
//     fetch(`https://esi.evetech.net/latest/markets/${region}/orders/?type_id=${selectedItem.id}`)
//       .then((res) => res.json())
//       .then((data: Order[]) => {
//         const sellOrders = data.filter((order) => !order.is_buy_order);
//         const buyOrders = data.filter((order) => order.is_buy_order);
//         setOrders({ sell: sellOrders, buy: buyOrders });
//       });
//   }, [selectedItem, region]);

//   return (
//     <div className="p-4 max-w-3xl mx-auto">
//       <Input
//         placeholder="Введите название предмета"
//         value={search}
//         onChange={(e) => setSearch(e.target.value)}
//       />

//       {filteredItems.length > 0 && (
//         <div className="mt-2 border rounded-md max-h-60 overflow-y-auto">
//           {filteredItems.map((item) => (
//             <div
//               key={item.id}
//               className="p-2 cursor-pointer hover:bg-gray-200"
//               onClick={() => {
//                 setSelectedItem(item);
//                 setSearch(item.name.ru || item.name.en || "");
//               }}
//             >
//               {item.name.ru || item.name.en}
//             </div>
//           ))}
//         </div>
//       )}

//       {selectedItem && (
//         <div className="mt-4">
//           <h2 className="text-lg font-semibold">{selectedItem.name.ru || selectedItem.name.en}</h2>
//           <div className="mt-2 flex gap-4">
//             {Object.entries(REGIONS).map(([name, id]) => (
//               <button
//                 key={id}
//                 className={`px-4 py-2 border rounded-md ${region === id ? "bg-blue-500 text-white" : ""}`}
//                 onClick={() => setRegion(id)}
//               >
//                 {name}
//               </button>
//             ))}
//           </div>

//           <Tabs defaultValue="sell" className="mt-4">
//             <TabsList>
//               <TabsTrigger value="sell">Sell Orders</TabsTrigger>
//               <TabsTrigger value="buy">Buy Orders</TabsTrigger>
//             </TabsList>

//             <TabsContent value="sell">
//               <OrderTable orders={orders.sell} />
//             </TabsContent>
//             <TabsContent value="buy">
//               <OrderTable orders={orders.buy} />
//             </TabsContent>
//           </Tabs>
//         </div>
//       )}
//     </div>
//   );
// }

// function OrderTable({ orders }: { orders: Order[] }) {
//   return (
//     <Card>
//       <CardContent>
//         {orders.length === 0 ? (
//           <p>Нет данных</p>
//         ) : (
//           <table className="w-full border-collapse border mt-2">
//             <thead>
//               <tr className="bg-gray-100">
//                 <th className="border p-2">Region</th>
//                 <th className="border p-2">Station</th>
//                 <th className="border p-2">Price (ISK)</th>
//                 <th className="border p-2">Quantity</th>
//                 <th className="border p-2">Min. qty</th>
//                 <th className="border p-2">Expires</th>
//                 <th className="border p-2">First seen</th>
//               </tr>
//             </thead>
//             <tbody>
//               {orders.map((order) => (
//                 <tr key={order.order_id}>
//                   <td className="border p-2">{order.is_buy_order ? "Buy" : "Sell"}</td>
//                   <td className="border p-2">{order.location_id}</td>
//                   <td className="border p-2">{order.price.toLocaleString()} ISK</td>
//                   <td className="border p-2">{order.volume_remain}</td>
//                   <td className="border p-2">{order.min_volume}</td>
//                   <td className="border p-2">-</td>
//                   <td className="border p-2">{new Date(order.issued).toLocaleDateString()}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         )}
//       </CardContent>
//     </Card>
//   );
// }

// import { useState, useEffect } from "react";
// import data from "@/data/typesnew.json";
// import { Input } from "@/components/ui/input";
// import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
// import { Card, CardContent } from "@/components/ui/card";

// interface Item {
//   id: number;
//   name: {
//     en: string | null;
//     ru: string | null;
//   };
// }

// interface Order {
//   order_id: number;
//   price: number;
//   volume_remain: number;
//   location_id: number;
//   is_buy_order: boolean;
// }

// const REGIONS: Record<string, number> = {
//   Jita: 10000002,
//   Amarr: 10000043,
// };

// export default function MarketOrders() {
//   const [search, setSearch] = useState("");
//   const [selectedItem, setSelectedItem] = useState<Item | null>(null);
//   const [region, setRegion] = useState<number>(REGIONS.Jita);
//   const [orders, setOrders] = useState<{ sell: Order[]; buy: Order[] }>({ sell: [], buy: [] });

//   // Поиск по русскому и английскому названию
//   const filteredItems: Item[] = Object.values(data).filter((item: Item) => {
//     const nameEn = item.name.en?.toLowerCase() || "";
//     const nameRu = item.name.ru?.toLowerCase() || "";
//     return search ? nameEn.includes(search.toLowerCase()) || nameRu.includes(search.toLowerCase()) : false;
//   });

//   // Загрузка ордеров при выборе предмета
//   useEffect(() => {
//     if (!selectedItem) return;
//     fetch(`https://esi.evetech.net/latest/markets/${region}/orders/?type_id=${selectedItem.id}`)
//       .then((res) => res.json())
//       .then((data: Order[]) => {
//         const sellOrders = data.filter((order) => !order.is_buy_order);
//         const buyOrders = data.filter((order) => order.is_buy_order);
//         setOrders({ sell: sellOrders, buy: buyOrders });
//       });
//   }, [selectedItem, region]);

//   return (
//     <div className="p-4 max-w-3xl mx-auto">
//       <Input
//         placeholder="Введите название предмета"
//         value={search}
//         onChange={(e) => setSearch(e.target.value)}
//       />

//       {filteredItems.length > 0 && (
//         <div className="mt-2 border rounded-md max-h-60 overflow-y-auto">
//           {filteredItems.map((item) => (
//             <div
//               key={item.id}
//               className="p-2 cursor-pointer hover:bg-gray-200"
//               onClick={() => {
//                 setSelectedItem(item);
//                 setSearch(item.name.ru || item.name.en || "");
//               }}
//             >
//               {item.name.ru || item.name.en}
//             </div>
//           ))}
//         </div>
//       )}

//       {selectedItem && (
//         <div className="mt-4">
//           <h2 className="text-lg font-semibold">{selectedItem.name.ru || selectedItem.name.en}</h2>
//           <div className="mt-2 flex gap-4">
//             {Object.entries(REGIONS).map(([name, id]) => (
//               <button
//                 key={id}
//                 className={`px-4 py-2 border rounded-md ${region === id ? "bg-blue-500 text-white" : ""}`}
//                 onClick={() => setRegion(id)}
//               >
//                 {name}
//               </button>
//             ))}
//           </div>

//           <Tabs defaultValue="sell" className="mt-4">
//             <TabsList>
//               <TabsTrigger value="sell">Sell Orders</TabsTrigger>
//               <TabsTrigger value="buy">Buy Orders</TabsTrigger>
//             </TabsList>

//             <TabsContent value="sell">
//               <OrderTable orders={orders.sell} />
//             </TabsContent>
//             <TabsContent value="buy">
//               <OrderTable orders={orders.buy} />
//             </TabsContent>
//           </Tabs>
//         </div>
//       )}
//     </div>
//   );
// }

// function OrderTable({ orders }: { orders: Order[] }) {
//   return (
//     <Card>
//       <CardContent>
//         {orders.length === 0 ? (
//           <p>Нет данных</p>
//         ) : (
//           <table className="w-full border-collapse border mt-2">
//             <thead>
//               <tr className="bg-gray-100">
//                 <th className="border p-2">Цена</th>
//                 <th className="border p-2">Количество</th>
//                 <th className="border p-2">Станция</th>
//               </tr>
//             </thead>
//             <tbody>
//               {orders.map((order) => (
//                 <tr key={order.order_id}>
//                   <td className="border p-2">{order.price.toLocaleString()} ISK</td>
//                   <td className="border p-2">{order.volume_remain}</td>
//                   <td className="border p-2">{order.location_id}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         )}
//       </CardContent>
//     </Card>
//   );
// }

// import { useState, useEffect } from "react";
// import data from "@/data/typesnew.json";
// import { Input } from "@/components/ui/input";
// import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
// import { Card, CardContent } from "@/components/ui/card";

// const REGIONS = {
//   Jita: 10000002,
//   Amarr: 10000043,
// };

// export default function MarketOrders() {
//   const [search, setSearch] = useState("");
//   const [selectedItem, setSelectedItem] = useState(null);
//   const [region, setRegion] = useState(REGIONS.Jita);
//   const [orders, setOrders] = useState({ sell: [], buy: [] });

//   // Поиск по русскому и английскому названию
//   const filteredItems = Object.values(data).filter((item) =>
//     search
//       ? item.name.en.toLowerCase().includes(search.toLowerCase()) ||
//         item.name.ru.toLowerCase().includes(search.toLowerCase())
//       : false
//   );

//   // Загрузка ордеров при выборе предмета
//   useEffect(() => {
//     if (!selectedItem) return;
//     fetch(`https://esi.evetech.net/latest/markets/${region}/orders/?type_id=${selectedItem.id}`)
//       .then((res) => res.json())
//       .then((data) => {
//         const sellOrders = data.filter((order) => !order.is_buy_order);
//         const buyOrders = data.filter((order) => order.is_buy_order);
//         setOrders({ sell: sellOrders, buy: buyOrders });
//       });
//   }, [selectedItem, region]);

//   return (
//     <div className="p-4 max-w-3xl mx-auto">
//       <Input
//         placeholder="Введите название предмета"
//         value={search}
//         onChange={(e) => setSearch(e.target.value)}
//       />

//       {filteredItems.length > 0 && (
//         <div className="mt-2 border rounded-md max-h-60 overflow-y-auto">
//           {filteredItems.map((item) => (
//             <div
//               key={item.id}
//               className="p-2 cursor-pointer hover:bg-gray-200"
//               onClick={() => {
//                 setSelectedItem(item);
//                 setSearch(item.name.ru || item.name.en);
//               }}
//             >
//               {item.name.ru || item.name.en}
//             </div>
//           ))}
//         </div>
//       )}

//       {selectedItem && (
//         <div className="mt-4">
//           <h2 className="text-lg font-semibold">{selectedItem.name.ru || selectedItem.name.en}</h2>
//           <div className="mt-2 flex gap-4">
//             {Object.entries(REGIONS).map(([name, id]) => (
//               <button
//                 key={id}
//                 className={`px-4 py-2 border rounded-md ${region === id ? "bg-blue-500 text-white" : ""}`}
//                 onClick={() => setRegion(id)}
//               >
//                 {name}
//               </button>
//             ))}
//           </div>

//           <Tabs defaultValue="sell" className="mt-4">
//             <TabsList>
//               <TabsTrigger value="sell">Sell Orders</TabsTrigger>
//               <TabsTrigger value="buy">Buy Orders</TabsTrigger>
//             </TabsList>

//             <TabsContent value="sell">
//               <OrderTable orders={orders.sell} />
//             </TabsContent>
//             <TabsContent value="buy">
//               <OrderTable orders={orders.buy} />
//             </TabsContent>
//           </Tabs>
//         </div>
//       )}
//     </div>
//   );
// }

// function OrderTable({ orders }) {
//   return (
//     <Card>
//       <CardContent>
//         {orders.length === 0 ? (
//           <p>Нет данных</p>
//         ) : (
//           <table className="w-full border-collapse border mt-2">
//             <thead>
//               <tr className="bg-gray-100">
//                 <th className="border p-2">Цена</th>
//                 <th className="border p-2">Количество</th>
//                 <th className="border p-2">Станция</th>
//               </tr>
//             </thead>
//             <tbody>
//               {orders.map((order) => (
//                 <tr key={order.order_id}>
//                   <td className="border p-2">{order.price.toLocaleString()} ISK</td>
//                   <td className="border p-2">{order.volume_remain}</td>
//                   <td className="border p-2">{order.location_id}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         )}
//       </CardContent>
//     </Card>
//   );
// }
