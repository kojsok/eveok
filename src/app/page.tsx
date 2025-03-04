import Hero from "@/components/Hero";


export default function Home() {
  return (
    // <div className="min-h-screen bg-background text-foreground overflow-hidden">
       <div className="flex flex-col min-h-screen bg-slate-950">
      {/* Главный контейнер */}
      {/* <main className="flex flex-col justify-center items-center min-h-screen p-4 md:p-8"> */}
      <main className="flex overflow-hidden flex-col items-center pt-2 w-full  bg-slate-950 max-md:max-w-full">
        {/* Ограниченная ширина контейнера */}
        <div className="max-w-screen-xl w-full flex flex-col gap-6">
          <Hero />
          {/* <ShipsList data={CombinedShipsData} /> */}
        </div>
      </main>

      
    </div>
  );
}
