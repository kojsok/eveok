"use client";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import axios from "axios";
import { SquareX, Square, Sparkles } from "lucide-react";
import typeData from "@/data/typesnew.json";


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

interface Skill {
  skill_id: number;
  active_skill_level: number;
  trained_skill_level: number;
  skillpoints_in_skill: number;
}

const SkillLevel = ({ active, trained }: { active: number, trained: number }) => {
  return (
    <div className="flex gap-1 items-center">
      {[...Array(5)].map((_, i) => {
        const level = i + 1;
        return (
          <div key={level} className="relative">
            {level <= active ? (
              <SquareX className="text-slate-200" size={18} />
            ) : level <= trained ? (
              <Square className="text-slate-300" size={18} />
            ) : (
              <Square className="text-slate-500" size={18} />
            )}
            {level === active && trained > active && (
              <Sparkles 
                className="absolute -top-1 -right-1 text-yellow-400 animate-pulse" 
                size={12} 
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

const SkillSP = ({ sp }: { sp: number }) => {
  const formattedSP = new Intl.NumberFormat().format(sp);
  return (
    <div className="flex items-center gap-2 text-slate-300">
      <span className="text-sm">{formattedSP} SP</span>
    </div>
  );
};

export default function Skills() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSkills = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get("/api/skills");
        setSkills(data);
      } catch (err) {
        console.error("Ошибка загрузки данных:", err);
        setError("Ошибка загрузки скиллов");
      }
      setLoading(false);
    };

    fetchSkills();
  }, []);

  if (loading) return <p className="text-slate-300">Загрузка...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (

    <div className="container mx-auto px-4">
      <h2 className="text-xl text-slate-300 font-bold text-center mb-2">Все навыки</h2>
      <div className="grid grid-cols-1 gap-4">
        {skills.map((skill) => {
          const skillId = skill.skill_id.toString();
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
              key={skill.skill_id} 
              className="bg-slate-800 p-4 rounded-lg shadow-lg flex flex-col space-y-4 w-full max-w-2xl mx-auto hover:bg-slate-700 transition-colors duration-300"
            >
              <div className="flex justify-between items-center text-slate-300">
                {/* Левая часть */}
                <div className="flex items-center gap-4">
                  <SkillLevel 
                    active={skill.active_skill_level} 
                    trained={skill.trained_skill_level} 
                  />
                  <span className="text-sm">
                    {skillInfo?.name.ru || `Skill ID: ${skill.skill_id}`}
                  </span>
                </div>
                
                {/* Правая часть */}
                <SkillSP sp={skill.skillpoints_in_skill} />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

