// types.ts

export interface Ship {
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
  }
  
  export interface SubGroup {
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
    ships?: Ship[];
  }
  
  export interface Group {
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
  
  export interface ShipsData {
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