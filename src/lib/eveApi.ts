import axios, { AxiosError } from "axios";

export async function getSkillQueue(token: string) {
  try {
    const { data: charData } = await axios.get("https://esi.evetech.net/verify/", {
      headers: { Authorization: `Bearer ${token}` },
    });

    // console.log("✅ Данные персонажа:", charData);

    const characterId = charData.CharacterID;

    const { data } = await axios.get(`https://esi.evetech.net/dev/characters/${characterId}/skillqueue/`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // console.log("✅ Очередь обучения загружена:", data);

    return data;
  } catch (error: unknown) { // Используем unknown
    if (error instanceof AxiosError) {
      console.error(
        "❌ Ошибка при запросе ESI API:",
        error.response?.data || error.message
      );
      throw error;
    }
    // Обработка других типов ошибок (например, сетевых)
    console.error("Неизвестная ошибка:", error);
    throw error;
  }
}




export async function getSkills(token: string) {
  try {
    const { data: charData } = await axios.get("https://esi.evetech.net/verify/", {
      headers: { Authorization: `Bearer ${token}` },
    });

    // console.log("✅ Данные персонажа:", charData);

    const characterId = charData.CharacterID;

    const { data } = await axios.get(`https://esi.evetech.net/dev/characters/${characterId}/skills/`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    

    // console.log("✅ Скиллы загружены:", data.skills);

    return data.skills;
  } catch (error: unknown) { // Используем unknown
    if (error instanceof AxiosError) {
      console.error(
        "❌ Ошибка при запросе ESI API:",
        error.response?.data || error.message
      );
      throw error;
    }
    // Обработка других типов ошибок (например, сетевых)
    console.error("Неизвестная ошибка:", error);
    throw error;
  }
}



// src/lib/eveApi.ts
export async function getUserInfo(token: string) {
  try {
    const { data: userData } = await axios.get("https://esi.evetech.net/verify/", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const { data: characterData } = await axios.get(
      `https://esi.evetech.net/latest/characters/${userData.CharacterID}/`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    return {
      CharacterID: userData.CharacterID,
      CharacterName: userData.CharacterName,
      // Исправлено на корректное поле из characterData
      CorporationID: characterData.corporation_id,
      AllianceID: characterData.alliance_id || null,
      SecurityStatus: characterData.security_status,
      // Добавлена очистка HTML из описания
      Description: characterData.description 
        ? characterData.description.replace(/<[^>]+>/g, '') 
        : "Нет описания",
      Title: characterData.title || "Нет титула",
    };
  } catch (error: unknown) { // Используем unknown
    if (error instanceof AxiosError) {
      console.error(
        "❌ Ошибка при запросе ESI API:",
        error.response?.data || error.message
      );
      throw error;
    }
    // Обработка других типов ошибок (например, сетевых)
    console.error("Неизвестная ошибка:", error);
    throw error;
  }
}
