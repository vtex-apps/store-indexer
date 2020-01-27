export const tenMinutesFromNowMS = () =>
  `${new Date(Date.now() + 10 * 60 * 1000)}`
export const STORE_LOCATOR = 'vtex.store@2.x'
export const ROUTES_JSON_PATH = 'dist/vtex.store-indexer/build.json'
export const PAGE_TYPES = {
  ['PRODUCT']: 'product',
  ['BRAND']: 'brand',
  ['CATEGORY']: 'category',
  ['SUBCATEGORY']: 'subcategory',
  ['DEPARTMENT']: 'department',
  ['PRODUCT_NOT_FOUND']: 'productNotFound',
}

export const slugify = (str: string) =>
  str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
