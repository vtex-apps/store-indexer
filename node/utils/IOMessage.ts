

export const toSkuProvider = (id: string) => `SKU-id.${id}`
export const toProductProvider = (id: string) => `Product-id.${id}`
export const toBrandProvider = (id: string) => `Brand-id.${id}`
export const toCategoryProvider = (id: number) => `Category-id.${id}`
export const providerToVbaseFilename = (provider: string) => `${provider}.json`
export const toSkuSpecificationID = (id: string, property: string) => `id-${id}.${property}`
