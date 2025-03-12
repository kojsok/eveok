


//!это финал и билдится 
"use client";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import axios from "axios";
import { SquareX, Square, Sparkles } from "lucide-react";
// import typeData from "@/data/typesnew.json";
import typeData from "@/data/typesnew.json" assert { type: "json" };

// Типизация данных из JSON
interface SkillType {
    id: number;
    iconID: number | null;    // Добавлено | null
    graphicID: number | null; // Убедитесь, что тоже разрешено null
    name: {
        en: string;
        ru: string | null;
    };
    basePrice: number | null; // Добавлено | null
}

// Типизация всего объекта typeData
interface TypeData {
    [key: string]: SkillType;
}

interface SkillQueueEntry {
    skill_id: number;
    finish_date?: string;
    finished_level: number;
    queue_position: number;
    start_sp: number;
    end_sp: number;
    duration: number | null; // Обязательное поле с типом number | null
}

const SkillLevel = ({ level }: { level: number }) => (
    <div className="flex gap-1 items-center">
        {[...Array(5)].map((_, i) => {
            const skillLevel = i + 1;
            return (
                <div key={skillLevel} className="relative">
                    {skillLevel <= level ? (
                        <SquareX className="text-slate-200" size={18} />
                    ) : (
                        <Square className="text-slate-500" size={18} />
                    )}
                    {skillLevel === level && (
                        <Sparkles className="absolute -top-1 -right-1 text-yellow-400 animate-pulse" size={12} />
                    )}
                </div>
            );
        })}
    </div>
);

const SkillQueue = () => {
    const [skillQueue, setSkillQueue] = useState<SkillQueueEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSkillQueue = async () => {
            setLoading(true);
            try {
                const { data } = await axios.get<SkillQueueEntry[]>("/api/skillqueue");
                const sortedData = data.sort((a: SkillQueueEntry, b: SkillQueueEntry) => 
                    a.queue_position - b.queue_position
                );
                
                const processedData = sortedData.map((entry: SkillQueueEntry, index: number) => {
                    if (!entry.finish_date) return { ...entry, duration: null };

                    const finishTime = new Date(entry.finish_date).getTime();
                    let duration;

                    if (index === 0) {
                        duration = finishTime - Date.now();
                    } else {
                        const prevFinishTime = new Date(sortedData[index - 1].finish_date!).getTime();
                        duration = finishTime - prevFinishTime;
                    }

                    return { ...entry, duration };
                });

                setSkillQueue(processedData);
            } catch (err) {
                console.error("Ошибка загрузки очереди:", err);
                setError("Ошибка загрузки очереди");
            }
            setLoading(false);
        };

        fetchSkillQueue();
    }, []);

    const formatTime = (duration: number | null): string => {
        if (!duration || duration <= 0) return "Завершено";

        const days = Math.floor(duration / (1000 * 60 * 60 * 24));
        const hours = Math.floor((duration % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));

        return `${days > 0 ? `${days}д ` : ''}${hours > 0 ? `${hours}ч ` : ''}${minutes}м`;
    };

    if (loading) return <p className="text-slate-300">Загрузка...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div className="container mx-auto px-4">
            <h2 className="text-xl text-slate-300 font-bold text-center mb-2">Очередь навыков</h2>
            <div className="grid grid-cols-1 gap-4">
                {skillQueue.map((entry) => {
                    const uniqueKey = `${entry.skill_id}-${entry.queue_position}`;
                    const skillId = entry.skill_id.toString();
                    // const skillInfo = (typeData as TypeData)[skillId];
                    const skillInfo = (typeData as TypeData)[skillId] ?? {
                        id: 0,
                        iconID: null,
                        graphicID: null,
                        name: { en: 'Unknown', ru: 'Неизвестно' },
                        basePrice: null
                      };

                    return (
                        <Card
                            key={uniqueKey}
                            className="bg-slate-800 p-4 rounded-lg shadow-lg flex flex-col space-y-4 w-full max-w-2xl mx-auto hover:bg-slate-700 transition-colors duration-300"
                        >
                            <div className="flex justify-between items-center text-slate-300">
                                <div className="flex items-center gap-4">
                                    <SkillLevel level={entry.finished_level} />
                                    <span className="text-sm">
                                        {skillInfo?.name.ru || `Skill ID: ${entry.skill_id}`}
                                    </span>
                                </div>

                                <div className="text-sm text-slate-400">
                                    {entry.finish_date ? (
                                        <span>{formatTime(entry.duration)}</span>
                                    ) : (
                                        <span>В очереди...</span>
                                    )}
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};

export default SkillQueue;

