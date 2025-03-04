// components/DonationPanel.tsx
"use client";
import { Copy } from "lucide-react";
import copy from "clipboard-copy";
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@radix-ui/react-tooltip";

const DonationPanel = () => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await copy("EVE-OK");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Сброс состояния через 2 секунды
    } catch (error) {
      console.error("Failed to copy text", error);
    }
  };

  return (
    <div
      className="ml-auto md:mx-auto p-4 bg-slate-950 text-slate-300 max-md:px-5 border-[1px] border-[rgba(105,113,162,0.16)] shadow-lg backdrop-blur-md transition-colors duration-300 rounded-lg"
    >
      <div className="flex items-center text-slate-300">
        Поддержите наш проект, отправив донат на корпорацию{" "}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleCopy}
                className={`font-bold flex items-center gap-1 px-2 py-1 rounded-full transition-colors ${
                  copied ? "text-green-400" : "text-[#4F97FF] hover:text-[#4F97FF]"
                }`}
              >
                EVE-OK <Copy size={16} />
              </button>
            </TooltipTrigger>
            <TooltipContent
              className="bg-slate-800 text-slate-300 px-2 py-1 rounded-md text-sm font-medium"
              sideOffset={5}
            >
              {copied ? "Скопировано!" : "Скопировать"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        {/* {" "}Каждый вклад важен для нас, поможет улучшать и добавлять новый функционал! */}
      </div>
    </div>
  );
};

export default DonationPanel;
