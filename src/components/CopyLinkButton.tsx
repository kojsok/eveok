"use client";

import { Copy } from "lucide-react";
import { useEffect, useState } from "react";

interface CopyLinkButtonProps {
    url: string; // Относительный путь
}

export default function CopyLinkButton({ url }: CopyLinkButtonProps) {
    const [copied, setCopied] = useState(false);
    const [fullUrl, setFullUrl] = useState("");

    useEffect(() => {
        if (typeof window !== "undefined") {
            // Генерируем полный URL
            setFullUrl(`${window.location.origin}${url}`);
        }
    }, [url]);

    const copyLinkToClipboard = async () => {
        if (!fullUrl) return;

        try {
            await navigator.clipboard.writeText(fullUrl);
            setCopied(true);
        } catch (error) {
            console.error("Не удалось скопировать ссылку:", error);
        }
    };

    useEffect(() => {
        if (copied) {
            const timer = setTimeout(() => setCopied(false), 2000); // Сброс состояния через 2 секунды
            return () => clearTimeout(timer);
        }
    }, [copied]);

    return (
        <button
            onClick={copyLinkToClipboard}
            className="inline-flex gap-2 justify-center items-center w-full sm:w-48 px-3 py-2 text-sm font-medium tracking-tight leading-tight text-white rounded-[10px] border border-[rgba(105,113,162,0.4)] bg-gradient-to-r from-[#161A31] to-[#06091F] transition-all duration-300 ease-in-out transform hover:scale-105 hover:bg-gradient-to-r hover:from-[#06091F] hover:to-[#161A31] shadow-md hover:shadow-lg"
        >
            <Copy className="h-4 w-4" />
            {copied ? "Ссылка скопирована!" : "Скопировать ссылку"}
        </button>
    );
}


// "use client";

// import { Copy } from "lucide-react";
// import { useEffect, useState } from "react";

// interface CopyLinkButtonProps {
//   url: string; // Относительный путь
// }

// export default function CopyLinkButton({ url }: CopyLinkButtonProps) {
//   const [copied, setCopied] = useState(false);
//   const [fullUrl, setFullUrl] = useState("");

//   useEffect(() => {
//     if (typeof window !== "undefined") {
//       setFullUrl(`${window.location.origin}${url}`);
//     }
//   }, [url]);

//   const copyLinkToClipboard = async () => {
//     try {
//       await navigator.clipboard.writeText(fullUrl);
//       setCopied(true);
//     } catch (error) {
//       console.error("Не удалось скопировать ссылку:", error);
//     }
//   };

//   useEffect(() => {
//     if (copied) {
//       const timer = setTimeout(() => setCopied(false), 2000); // Сброс состояния через 2 секунды
//       return () => clearTimeout(timer);
//     }
//   }, [copied]);

//   return (
//     <button
//       onClick={copyLinkToClipboard}
//       className="inline-flex gap-2 justify-center items-center w-full sm:w-48 px-3 py-2 text-sm font-medium tracking-tight leading-tight text-white rounded-[10px] border border-[rgba(105,113,162,0.4)] bg-gradient-to-r from-[#161A31] to-[#06091F] transition-all duration-300 ease-in-out transform hover:scale-105 hover:bg-gradient-to-r hover:from-[#06091F] hover:to-[#161A31] shadow-md hover:shadow-lg"
//     >
//       <Copy className="h-4 w-4" />
//       {copied ? "Ссылка скопирована!" : "Поделиться"}
//     </button>
//   );
// }


// "use client";

// import { Copy } from "lucide-react";
// import { useEffect, useState } from "react";

// interface CopyLinkButtonProps {
//     url: string;
// }

// export default function CopyLinkButton({ url }: CopyLinkButtonProps) {
//     const [copied, setCopied] = useState(false);

//     const copyLinkToClipboard = async () => {
//         try {
//             await navigator.clipboard.writeText(url);
//             setCopied(true);
//         } catch (error) {
//             console.error("Не удалось скопировать ссылку:", error);
//         }
//     };

//     useEffect(() => {
//         if (copied) {
//             const timer = setTimeout(() => setCopied(false), 2000); // Сброс состояния через 2 секунды
//             return () => clearTimeout(timer);
//         }
//     }, [copied]);

//     return (
//         <button
//             onClick={copyLinkToClipboard}
//             className="inline-flex gap-2 justify-center items-center w-full sm:w-48 px-3 py-2 text-sm font-medium tracking-tight leading-tight text-white rounded-[10px] border border-[rgba(105,113,162,0.4)] bg-gradient-to-r from-[#161A31] to-[#06091F] transition-all duration-300 ease-in-out transform hover:scale-105 hover:bg-gradient-to-r hover:from-[#06091F] hover:to-[#161A31] shadow-md hover:shadow-lg"
//         >
//             <Copy className="h-4 w-4" />
//             {copied ? "Ссылка скопирована!" : "Поделиться"}
//         </button>
//     );
// }