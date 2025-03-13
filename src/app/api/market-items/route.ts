
import { NextResponse } from 'next/server';
import marketData from '../../../data/market_items.json';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const search = url.searchParams.get('search')?.toLowerCase() || '';
    const limit = parseInt(url.searchParams.get('limit') || '50', 10);
    
    let items = Array.isArray(marketData) 
      ? marketData 
      : Object.values(marketData);
    
    if (search) {
      items = items.filter(item => 
        item.name.en?.toLowerCase().includes(search) || 
        item.name.ru?.toLowerCase().includes(search)
      );
    }
    
    return NextResponse.json(items.slice(0, limit));
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}



// import { NextResponse } from 'next/server';
// import marketData from '../../../data/market_items.json';

// export async function GET(req: Request) {
//   const url = new URL(req.url);
//   const search = url.searchParams.get('search')?.toLowerCase() || '';
//   const limit = parseInt(url.searchParams.get('limit') || '50', 10);

//   try {
//     const url = new URL(req.url);
//     const search = url.searchParams.get('search')?.toLowerCase() || '';
    
//     let items = marketData;
//     if (!Array.isArray(items)) items = Object.values(items);
    
//     if (search) {
//       items = items.filter(item => 
//         item.name.en?.toLowerCase().includes(search) || 
//         item.name.ru?.toLowerCase().includes(search)
//       );
//     }
    
//     return NextResponse.json(items.slice(0, limit));
//   } catch (error) {
//     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
//   }
// }

// // src/app/api/market-items/route.ts
// import { NextResponse } from 'next/server';
// import marketData from '../../../data/market_items.json';

// // interface Item {
// //   id: number;
// //   name: {
// //     en: string | null;
// //     ru: string | null;
// //   };
// // }

// export async function GET() {
//   try {
//     // Автоматически поддерживаем обе структуры
//     const items = Array.isArray(marketData) 
//       ? marketData 
//       : Object.values(marketData);
      
//     return NextResponse.json(items);
//   } catch (error) {
//     return NextResponse.json(
//       { error: 'Internal Server Error' },
//       { status: 500 }
//     );
//   }
// }