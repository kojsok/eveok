export interface TypesNew {
    [id: string]: Type;
  }
  
  export interface Type {
    id: number;
    iconID: number | null;
    graphicID: number;
    name: Name;
    basePrice: number | null;
  }
  
  export interface Name {
    en: string;
    ru: string;
  }



// export interface TypesNew {
//     [id: string]: Type;
//   }
  
//   export interface Type {
//     id: number;
//     iconID: number | null;
//     graphicID: number;
//     name: Name;
//     basePrice: number | null;
//   }
  
//   export interface Name {
//     en: string;
//     ru: string;
//   }
  
//   export interface DogmaAttributes {
//     [attributeID: string]: DogmaAttribute;
//   }
  
//   export interface DogmaAttribute {
//     attributeID: number;
//     description: string;
//     displayNameID: DisplayNameID;
//     tooltipDescriptionID: DisplayNameID;
//     tooltipTitleID: DisplayNameID;
//   }
  
//   export interface DisplayNameID {
//     en: string | null;
//     ru: string | null;
//   }
  
//   export interface EsiResponseType {
//     capacity: number;
//     description: string;
//     dogma_attributes: DogmaAttributeData[];
//     graphic_id: number;
//     group_id: number;
//     mass: number;
//     name: string;
//     packaged_volume: number;
//     portion_size: number;
//     published: boolean;
//     radius: number;
//     type_id: number;
//     volume: number;
//   }
  
//   export interface DogmaAttributeData {
//     attribute_id: number;
//     value: number;
//   }