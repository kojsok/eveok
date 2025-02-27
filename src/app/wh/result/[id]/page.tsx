import axios, { AxiosError } from "axios";
import fs from "fs";
import path from "path";
import { TypesNew, Type } from "../../../../types/index";

// Интерфейс для данных, полученных из ESI API
interface EsiResponseType {
  capacity?: number;
  description: string;
  dogma_attributes?: Array<{ attribute_id: number; value: number }>;
  graphic_id?: number;
  group_id?: number;
  mass?: number;
  name: string;
  packaged_volume?: number;
  portion_size?: number;
  published?: boolean;
  radius?: number;
  type_id: number;
  volume?: number;
}

// Интерфейс для данных из файла dogmaAttributes.json
interface DogmaAttribute {
  attributeID: number;
  description: string;
  displayNameID: { en: string | null; ru: string | null };
  tooltipDescriptionID: { en: string | null; ru: string | null };
  tooltipTitleID: { en: string | null; ru: string | null };
}

// Получение данных о червоточине по ID
const fetchEsiData = async (id: string): Promise<EsiResponseType | null> => {
  try {
    const response = await axios.get<EsiResponseType>(
      `https://esi.evetech.net/latest/universe/types/${id}`,
      { timeout: 15000 } // Увеличим таймаут до 15 секунд
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.code === "ECONNABORTED") {
      console.error(`Таймаут при загрузке данных для ID ${id}`);
    } else if (axiosError.response) {
      console.error(
        `Ошибка сервера при загрузке данных для ID ${id}:`,
        axiosError.response?.status,
        axiosError.response?.data
      );
    } else if (axiosError.request) {
      console.error(
        `Запрос не получил ответа для ID ${id}:`,
        axiosError.request
      );
    } else {
      console.error(`Ошибка при загрузке данных для ID ${id}:`, axiosError.message);
    }
    return null;
  }
};

// Чтение данных из файла dogmaAttributes.json
const loadDogmaAttributes = (): Record<string, DogmaAttribute> => {
  try {
    const filePath = path.join(process.cwd(), "src", "data", "dogmaAttributes.json");
    const fileContent = fs.readFileSync(filePath, "utf8");
    return JSON.parse(fileContent);
  } catch (error) {
    console.error("Ошибка при чтении файла dogmaAttributes.json:", error);
    return {};
  }
};

// Генерация списка ID червоточин
const generateWormholeIds = (): string[] => {
  try {
    const filePath = path.join(process.cwd(), "src", "data", "typesnew.json");
    const fileContent = fs.readFileSync(filePath, "utf8");
    const typesNew: TypesNew = JSON.parse(fileContent);
    return Object.values(typesNew)
      .filter((type: Type) => type.name.en.includes("Wormhole"))
      .map((type) => type.id.toString());
  } catch (error) {
    console.error("Ошибка при чтении файла typesnew.json:", error);
    return [];
  }
};

// Генерация статических параметров для динамических маршрутов
export const generateStaticParams = () => {
  return generateWormholeIds().map((id) => ({ id }));
};

// Компонент страницы
export default async function WormholePage({
  params,
}: {
  params: Promise<{ id: string }>; // Параметры маршрута как промис
}) {
  // Дождитесь получения параметров маршрута
  const { id } = await params;

  // Получаем данные о червоточине
  const esiData = await fetchEsiData(id);

  // Если данные отсутствуют или произошла ошибка, показываем страницу ошибки
  if (!esiData || !esiData.name) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-950 text-red-500">
        <h1 className="text-4xl font-bold">Ошибка загрузки данных</h1>
        <p className="text-lg mt-4">Не удалось получить информацию о червоточине с ID {id}.</p>
      </div>
    );
  }

  // Загружаем данные о dogma attributes
  const dogmaAttributes = loadDogmaAttributes();

  return (
    <div className="mx-auto p-4 w-full max-w-screen-xl bg-gradient-to-r from-[#04071D] via-[#04071D] to-[#0C0E23] border border-[rgba(105,113,162,0.16)] shadow-lg backdrop-blur-md transition-colors duration-300 rounded-lg text-slate-300">
      {/* Заголовок червоточины */}
      <div className="bg-slate-900 p-6 mb-6 bg-gradient-to-r from-[#04071D] via-[#04071D] to-[#0C0E23] border border-[rgba(105,113,162,0.16)] shadow-lg backdrop-blur-md transition-colors duration-300 rounded-lg text-slate-300">
        <h1 className="text-3xl font-bold text-slate-200">{esiData.name}</h1>
        <p className="text-lg text-slate-400 mt-2">{esiData.description}</p>
      </div>

      {/* Список атрибутов */}
      <div className="bg-slate-900 p-4 bg-gradient-to-r from-[#04071D] via-[#04071D] to-[#0C0E23] border border-[rgba(105,113,162,0.16)] shadow-lg backdrop-blur-md transition-colors duration-300 rounded-lg text-slate-300">
        <h2 className="text-2xl font-semibold text-slate-300 mb-4">Атрибуты:</h2>
        <ul>
          {esiData.dogma_attributes?.map((attr) => {
            const attributeId = attr.attribute_id.toString();
            const attribute = dogmaAttributes[attributeId];
            const description = attribute ? attribute.description : "Описание не найдено";

            return (
              <li
                key={attr.attribute_id}
                className="bg-slate-900 p-2 rounded-lg shadow-md flex items-center justify-between w-full transition-colors duration-300 hover:bg-gray-500 my-2"
              >
                <span className="text-lg font-semibold text-slate-300">{description}</span>
                <span className="text-lg font-medium text-slate-200">{attr.value}</span>
              </li>
            );
          }) || (
            <li className="text-slate-400 text-lg font-medium py-2">
              Нет атрибутов.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

