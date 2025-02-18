"use client";
import React, { useState, useEffect } from "react";
import dogmaAttributesRaw from "../data/dogmaAttributes.json"; // Импорт JSON-файла с атрибутами
import combinedShipsDataRaw from "../data/CombinedShipsData.json"; // Импорт CombinedShipsData.json
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"; // Компоненты shadcn
import Image from "next/image";


// Интерфейсы для типизации данных
interface DogmaAttribute {
  attributeID: number;
  description: string | null;
  displayNameID: {
    en: string | null;
    ru: string | null;
  };
  tooltipDescriptionID: {
    en: string | null;
    ru: string | null;
  };
  tooltipTitleID: {
    en: string | null;
    ru: string | null;
  };
}

interface ShipData {
  name: string;
  description: string;
  volume: number;
  mass: number;
  radius: number;
  dogma_attributes: Array<{
    attribute_id: number;
    value: number;
  }>;
  traits?: {
    types: Record<string, Array<{ bonus: number; bonusText: { en: string; ru: string } }>>;
  };
}

interface SkillData {
  typeId: number;
  name: string;
  description: string;
}

interface Ship {
  id: number;
  name: {
    en: string;
    ru: string;
  };
  description: {
    en: string;
    ru: string;
  };
  basePrice: number;
  image_url: string;
  traits?: {
    types: Record<string, Array<{ bonus: number; bonusText: { en: string; ru: string } }>>;
  };
}

interface SubGroup {
  groupId: number;
  description: {
    en: string;
    ru: string;
  };
  name: {
    en: string;
    ru: string;
  };
  subGroups: Record<string, SubGroup>;
  ships: Ship[];
}

interface Group {
  groupId: number;
  description: {
    en: string;
    ru: string;
  };
  name: {
    en: string;
    ru: string;
  };
  subGroups: Record<string, SubGroup>;
}

const attributeCategories = [
  {
    title: "Отсеки и слоты",
    attributeIDs: [12, 13, 14, 101, 102, 1154],
  },
  {
    title: "Щиты",
    attributeIDs: [263, 271, 272, 273, 274],
  },
  {
    title: "Броня",
    attributeIDs: [265, 267, 268, 269, 270],
  },
  {
    title: "Общие характеристики",
    attributeIDs: [4, 9, 37, 552, 70, 552, 48, 564, 11, 70, 76, 600, 633, 161, 192, 208, 209, 210, 211, 1271, 1281, 263, 265, 283, 2115, 422, 482],
  },


  // {
  //   title: "Сопротивляемость",
  //   attributeIDs: [109, 110, 111, 113],
  // },
];

const findShipById = (data: Group | SubGroup, typeId: number): Ship | null => {
  if ("ships" in data && Array.isArray(data.ships)) {
    const ship = data.ships.find((ship) => ship.id === typeId);
    if (ship) return ship;
  }
  if (data.subGroups) {
    for (const subGroup of Object.values(data.subGroups)) {
      const result = findShipById(subGroup, typeId);
      if (result) return result;
    }
  }
  return null;
};

const ShipInfo: React.FC<{ typeId: number }> = ({ typeId }) => {
  const [shipData, setShipData] = useState<ShipData | null>(null);
  const [skillsData, setSkillsData] = useState<Record<number, SkillData>>({});

  useEffect(() => {
    const fetchShipData = async () => {
      try {
        const response = await fetch(`https://esi.evetech.net/legacy/universe/types/${typeId}/`);
        if (!response.ok) {
          throw new Error("Failed to fetch ship data from ESI API");
        }
        const esiData = await response.json();
        const shipsData = combinedShipsDataRaw as unknown as Group;
        if (!shipsData || typeof shipsData !== "object" || !("subGroups" in shipsData)) {
          throw new Error("Invalid structure of CombinedShipsData");
        }
        const combinedShip = findShipById(shipsData, typeId);
        if (!combinedShip) {
          throw new Error("Ship not found in CombinedShipsData");
        }
        const formattedShipData: ShipData = {
          name: combinedShip.name.ru || combinedShip.name.en,
          description: combinedShip.description.ru || combinedShip.description.en,
          volume: esiData.volume || 0,
          mass: esiData.mass || 0,
          radius: esiData.radius || 0,
          dogma_attributes: esiData.dogma_attributes || [],
          traits: combinedShip.traits || { types: {} },
        };
        setShipData(formattedShipData);

        // Проверяем, что traits существует перед работой с ним
        if (formattedShipData.traits && formattedShipData.traits.types) {
          const skillTypeIds = Object.keys(formattedShipData.traits.types || {}).map(Number);
          const skillsPromises = skillTypeIds.map(async (skillTypeId) => {
            const skillResponse = await fetch(
              `https://esi.evetech.net/legacy/universe/types/${skillTypeId}/`
            );
            if (skillResponse.ok) {
              const skillInfo = await skillResponse.json();
              return {
                [skillTypeId]: {
                  name: skillInfo.name,
                  description: skillInfo.description,
                },
              } as Record<number, SkillData>;
            }
            return {};
          });

          const skillsResults = await Promise.all(skillsPromises);
          const mergedSkillsData = skillsResults.reduce(
            (acc, curr) => ({ ...acc, ...curr }),
            {} as Record<number, SkillData>
          );

          setSkillsData((prevSkillsData) => ({ ...prevSkillsData, ...mergedSkillsData }));
        }
      } catch (error) {
        console.error("Ошибка при загрузке данных о корабле:", error);
      }
    };
    fetchShipData();
  }, [typeId]);

  const getAttributeDescription = (attributeId: number): DogmaAttribute | undefined => {
    return (dogmaAttributesRaw as Record<string, DogmaAttribute>)[attributeId.toString()];
  };

  const formatValue = (value: number): string => {
    if (value > 1000) {
      return value.toLocaleString() + " ";
    }
    return value.toString();
  };

  if (!shipData) {
    return <p>Загрузка...</p>;
  }

  return (
    <div className="flex flex-col md:flex-row gap-4 p-4">
      <div className="w-full md:w-1/3">
        <Image
          src={shipData.volume ? `https://images.evetech.net/types/${typeId}/render` : "/default-ship.png"}
          alt={shipData.name}
          width={512}
          height={512}
          unoptimized
          className="rounded-lg object-cover"
        />
      </div>
      <div className="w-full md:w-2/3">
        <h1 className="text-2xl font-bold mb-2 text-slate-300">{shipData.name}</h1>
        <p className="mb-4 text-slate-300">{shipData.description}</p>
        <div className="grid grid-cols-2 gap-2">
          <div className="text-slate-300">Объем:</div>
          <div className="text-slate-300">{shipData.volume.toLocaleString()} м³</div>
          <div className="text-slate-300">Масса:</div>
          <div className="text-slate-300">{shipData.mass.toLocaleString()} кг</div>
          <div className="text-slate-300">Радиус:</div>
          <div className="text-slate-300">{shipData.radius} м</div>
        </div>


        {shipData.traits &&
          Object.keys(shipData.traits.types || {}).length > 0 && (
            <div className="mt-4 border rounded-lg p-4">
              <Accordion type="single" collapsible>
                <AccordionItem value="item-1">
                  <AccordionTrigger className="text-slate-300">Бонусы корабля и требуемые навыки</AccordionTrigger>
                  <AccordionContent>
                    {Object.entries(shipData.traits.types || {}).map(([typeIdStr, bonuses]) => {
                      const typeId = parseInt(typeIdStr, 10);
                      const skill = skillsData[typeId];
                      return (
                        <div className="text-slate-300" key={typeId}>
                          {skill && (
                            <p className="text-slate-500">
                              Требуемый навык: {skill.name} - {skill.description}
                            </p>
                          )}
                          {Array.isArray(bonuses) &&
                            bonuses.map((bonus, index) => (
                              <p key={index}>
                                -{" "}
                                {bonus.bonusText?.ru
                                  ?.replace(/<[^>]*>/g, "") // Удаляем HTML-теги
                                  ?.replace(/ ]+>/g, "") || // Убираем лишние пробелы
                                  "Неизвестный бонус"}{" "}
                                ({bonus.bonus}%)
                              </p>
                            ))}
                        </div>
                      );
                    })}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {/* <h2 className="text-xl font-semibold mb-2">Бонусы и навыки</h2> */}

            </div>
          )}




        {attributeCategories.map((category) => {
          const categoryAttributes = shipData.dogma_attributes.filter((attr) =>
            category.attributeIDs.includes(attr.attribute_id)
          );
          if (categoryAttributes.length === 0) return null;
          return (
            <div key={category.title} className="mt-4 border rounded-lg p-4 text-slate-300">
              <Accordion type="single" collapsible>
                <AccordionItem value="item-1">
                  <AccordionTrigger>{category.title}</AccordionTrigger>
                  <AccordionContent>
                    {categoryAttributes.map((attr) => {
                      const attrDescription = getAttributeDescription(attr.attribute_id);
                      const displayName =
                        attrDescription?.displayNameID.ru ||
                        attrDescription?.displayNameID.en ||
                        "Unknown";
                      let barColor = "";
                      let isProgressBar = false;
                      switch (displayName) {
                        case "Сопротивляемость щитов ЭМ-урону":
                        case "Сопротивляемость брони ЭМ-урону":
                          barColor = "bg-blue-500/50";
                          isProgressBar = true;
                          break;
                        case "Сопротивляемость щитов термическому урону":
                        case "Сопротивляемость брони термическому урону":
                          barColor = "bg-red-500/50";
                          isProgressBar = true;
                          break;
                        case "Сопротивляемость щитов кинетическому урону":
                        case "Сопротивляемость брони кинетическому урону":
                          barColor = "bg-gray-500/50";
                          isProgressBar = true;
                          break;
                        case "Сопротивляемость щитов фугасному урону":
                        case "Сопротивляемость брони фугасному урону":
                          barColor = "bg-yellow-500/50";
                          isProgressBar = true;
                          break;
                        default:
                          isProgressBar = false;
                      }
                      if (isProgressBar) {
                        const value = Math.round(100 - (attr.value * 100)); // Преобразуем в проценты
                        return (
                          <div key={attr.attribute_id} className="flex items-center mb-4">
                            {/* Блок с названием (фиксированная ширина) */}
                            <div className="mr-4 w-1/2">{displayName}</div>
                            {/* Блок с прогресс-баром и процентами */}
                            <div className="flex-1 flex items-center">
                              <div className="relative w-full h-4 bg-gray-200 rounded-full">
                                <div
                                  className={`absolute top-0 left-0 h-full ${barColor} rounded-full`}
                                  style={{ width: `${value}%` }}
                                ></div>
                              </div>
                              <span className="ml-2">{value}%</span>
                            </div>
                          </div>
                        );
                      } else {
                        return (
                          <div key={attr.attribute_id} className="flex items-center justify-between mb-2">
                            <div>{displayName}</div>
                            <div>{formatValue(attr.value)}</div>
                          </div>
                        );
                      }
                    })}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              {/* <h2 className="text-xl font-semibold mb-2">{category.title}</h2> */}

            </div>
          );
        })}


      </div>
    </div>
  );
};

export default ShipInfo;

