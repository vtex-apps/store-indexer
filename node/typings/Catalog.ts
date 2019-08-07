
/* Fields of interest of catalog items (in the future, they will be imported from store-ressources) */

export interface Brand {
  id: string
  name: string
  title: string
  metaTagDescription: string
}

export interface Category {
  id: number
  name: string
  titleTag: string
  metaTagDescription: string
}

export interface Product {
  productId: string
  productName: string
  titleTag: string
  metaTagDescription: string
  description: string
  descriptionShort: string
  keywords: string
}

export interface SpecificationGroup {
  name: string,
  specifications: [SpecificationGroupProperty],
}

export interface SpecificationGroupProperty {
  name: string
  values: [string]
}

export interface Property {
  name: string
  values: [string]
}

export interface SKU {
  id: string
  name: string
  nameComplete: string
  skuSpecifications: [Specification]
  productSpecifications: [Specification]
}

export interface Specification {
  fieldName: string
  fieldValues: [string]
}




