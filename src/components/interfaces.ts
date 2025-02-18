// interfaces.ts
export interface IShip {
    id: number;
    name: { en: string; ru: string };
    description: { en: string; ru: string };
    basePrice: number;
    image_url: string;
    traits: {
      types: Record<string, Array<{ bonus: number; bonusText: { en: string; ru: string } }>>;
    };
  }
  
  export interface IAttribute {
    attributeID: number;
    displayNameID: { en: string; ru: string };
    value?: number;
  }