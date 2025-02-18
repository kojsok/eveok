// Маппинг атрибутов к иконкам
export const attributeIcons: Record<string, string> = {
    "4": "30px-Icon_mass.png", // Масса
    "9": "30px-Icon_volume.png", // Объем
    "12": "30px-Icon_hi_slot.png", // Высокие слоты
    "13": "30px-Icon_mid_slot.png", // Средние слоты
    "14": "30px-Icon_low_slot.png", // Низкие слоты
    "101": "30px-Icon_rigs.png", // Риги
    "102": "30px-Icon_target_max.png", // Максимальное количество целей
    "109": "30px-Icon_resist_em.png", // Сопротивляемость ЭМ
    "110": "30px-Icon_resist_therm.png", // Сопротивляемость термическому
    "111": "30px-Icon_resist_kin.png", // Сопротивляемость кинетическому
    "113": "30px-Icon_resist_exp.png", // Сопротивляемость фугасному
    "263": "30px-Icon_shield.png", // Щит
    "265": "30px-Icon_armor.png", // Броня
    "48": "30px-Icon_capacitor_capacity.png", // Емкость конденсатора
    "552": "30px-Icon_powergrid.png", // Сетка питания
    "70": "30px-Icon_velocity.png", // Скорость
    "564": "30px-Icon_warp_speed.png", // Скорость варпа
  };


  export const attributeCategories1 = [
    {
      title: "Общие характеристики",
      attributeIDs: [ 4, 9, 37, 552, 70, 552, 48, 564, 11, 70, 76, 600, 633, 161, 192, 208, 209, 210, 211, 1271, 1281, 263, 265, 283, 2115, 422, 482,],
    },
    {
      title: "Щиты",
      attributeIDs: [263, 271, 272, 273, 274, 479],
    },
    {
      title: "Броня",
      attributeIDs: [265, 267, 268, 269, 270],
    },
    {
      title: "Отсеки и слоты",
      attributeIDs: [12, 13, 14, 101, 102, 1154],
    },
    {
      title: "Сопротивляемость",
      attributeIDs: [109, 110, 111, 113],
    },
  ];