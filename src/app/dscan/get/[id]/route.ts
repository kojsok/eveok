import { getFromDatabase } from '@/lib/db';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params; // Разрешаем промис
    const data = await getFromDatabase(id);

    if (!data) {
        return new Response('Данные не найдены', { status: 404 });
    }

    return new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
}



// import { use } from 'react';
// import { getFromDatabase } from '@/lib/db';

// export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
//     const { id } = use(params); // Разрешаем промис с помощью use
//     const data = await getFromDatabase(id);

//     if (!data) {
//         return new Response('Данные не найдены', { status: 404 });
//     }

//     return new Response(JSON.stringify(data), {
//         status: 200,
//         headers: { 'Content-Type': 'application/json' },
//     });
// }



// import { getFromDatabase } from "@/lib/db";

// interface Params {
//   id: string;
// }

// export async function GET(
//   request: Request, 
//   context: { params: Params }
// ) {
//   const id = context.params.id;
//   const data = await getFromDatabase(id);
  
//   if (!data) {
//     return new Response("Данные не найдены", { status: 404 });
//   }

//   return new Response(JSON.stringify(data), {
//     status: 200,
//     headers: { "Content-Type": "application/json" },
//   });
// }


// import { getFromDatabase } from "@/lib/db";

// export async function GET(request: Request, context: { params: { id: string } }) {
//     const id = context.params.id;
//     const data = await getFromDatabase(id);
//     if (!data) {
//         return new Response("Данные не найдены", { status: 404 });
//     }
//     return new Response(JSON.stringify(data), { status: 200, headers: { "Content-Type": "application/json" } });
// }


//!работает не трогать
// import { getFromDatabase } from "@/lib/db";

// export async function GET(request: Request, { params }: { params: { id: string } }) {
//     const id = params.id;
//     const data = await getFromDatabase(id);

//     if (!data) {
//         return new Response("Данные не найдены", { status: 404 });
//     }

//     return new Response(JSON.stringify(data), { status: 200, headers: { "Content-Type": "application/json" } });
// }