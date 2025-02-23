
import MarketOrders from "@/components/MarketOrders";


export default function Market() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      {/* Ограниченная ширина контейнера */}
      <div className="max-w-screen-xl w-full flex flex-col gap-6  pt-8 mx-auto">
        <MarketOrders />
      </div>
    </div>
  );
}