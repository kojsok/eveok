// pages/price.tsx

import RoutePlanner from "@/components/RoutePlanner";
// import StarMap from "@/components/StarMap";

export default function Price() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      {/* Полноэкранный контейнер для StarMap */}
      {/* <div className="relative w-full h-screen overflow-auto">
        <StarMap />
      </div> */}

      {/* Ограниченная ширина контейнера для остального содержимого */}
      <div className="max-w-screen-xl w-full flex flex-col gap-6 pt-8 mx-auto">
        {/* <p className="text-2xl font-bold mb-4 text-slate-300 items-center justify-center">Страница временно не доступна и находится в разработке</p> */}
        <RoutePlanner />
      </div>
    </div>
  );
}


// import RoutePlanner from "@/components/RoutePlanner";
// import StarMap from "@/components/StarMap";




// export default function Price() {
//   return (
//     <div className="flex flex-col min-h-screen bg-slate-950">
//       {/* Ограниченная ширина контейнера */}
//       <div className="max-w-screen-xl w-full flex flex-col gap-6  pt-8 mx-auto">
//         <StarMap />
        
//         {/* <p className="text-2xl font-bold mb-4 text-slate-300 items-center justify-center">Страница временно не доступна и находится в разработке</p> */}
//         <RoutePlanner />
//       </div>
//     </div>
//   );
// }