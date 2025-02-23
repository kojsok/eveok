"use client"
import { useState, useEffect } from "react";
import data from "@/data/typesnew.json";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

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
  min_volume: number;
  location_id: number;
  is_buy_order: boolean;
  issued: string;
}

const REGIONS: Record<string, number> = {
  Jita: 10000002,
  Amarr: 10000043,
};

export default function MarketOrders() {
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [region, setRegion] = useState<number>(REGIONS.Jita);
  const [orders, setOrders] = useState<{ sell: Order[]; buy: Order[] }>({ sell: [], buy: [] });

  const filteredItems: Item[] = Object.values(data).filter((item: Item) => {
    const nameEn = item.name.en?.toLowerCase() || "";
    const nameRu = item.name.ru?.toLowerCase() || "";
    return search ? nameEn.includes(search.toLowerCase()) || nameRu.includes(search.toLowerCase()) : false;
  });

  useEffect(() => {
    if (!selectedItem) return;
    fetch(`https://esi.evetech.net/latest/markets/${region}/orders/?type_id=${selectedItem.id}`)
      .then((res) => res.json())
      .then((data: Order[]) => {
        const sellOrders = data.filter((order) => !order.is_buy_order);
        const buyOrders = data.filter((order) => order.is_buy_order);
        setOrders({ sell: sellOrders, buy: buyOrders });
      });
  }, [selectedItem, region]);

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <Input
        placeholder="Введите название предмета"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {filteredItems.length > 0 && (
        <div className="mt-2 border rounded-md max-h-60 overflow-y-auto">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="p-2 cursor-pointer hover:bg-gray-200"
              onClick={() => {
                setSelectedItem(item);
                setSearch(item.name.ru || item.name.en || "");
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
              <button
                key={id}
                className={`px-4 py-2 border rounded-md ${region === id ? "bg-blue-500 text-white" : ""}`}
                onClick={() => setRegion(id)}
              >
                {name}
              </button>
            ))}
          </div>

          <Tabs defaultValue="sell" className="mt-4">
            <TabsList>
              <TabsTrigger value="sell">Sell Orders</TabsTrigger>
              <TabsTrigger value="buy">Buy Orders</TabsTrigger>
            </TabsList>

            <TabsContent value="sell">
              <OrderTable orders={orders.sell} />
            </TabsContent>
            <TabsContent value="buy">
              <OrderTable orders={orders.buy} />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}

function OrderTable({ orders }: { orders: Order[] }) {
  return (
    <Card>
      <CardContent>
        {orders.length === 0 ? (
          <p>Нет данных</p>
        ) : (
          <table className="w-full border-collapse border mt-2">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Region</th>
                <th className="border p-2">Station</th>
                <th className="border p-2">Price (ISK)</th>
                <th className="border p-2">Quantity</th>
                <th className="border p-2">Min. qty</th>
                <th className="border p-2">Expires</th>
                <th className="border p-2">First seen</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.order_id}>
                  <td className="border p-2">{order.is_buy_order ? "Buy" : "Sell"}</td>
                  <td className="border p-2">{order.location_id}</td>
                  <td className="border p-2">{order.price.toLocaleString()} ISK</td>
                  <td className="border p-2">{order.volume_remain}</td>
                  <td className="border p-2">{order.min_volume}</td>
                  <td className="border p-2">-</td>
                  <td className="border p-2">{new Date(order.issued).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
  );
}

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
