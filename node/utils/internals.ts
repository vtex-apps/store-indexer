/* eslint-disable no-useless-escape */
import { Apps } from '@vtex/api'
import RouteParser from 'route-parser'

export const INDEXED_ORIGIN = 'vtex.store-indexer@0.x:routes-indexing'
export const STORE_LOCATOR = 'vtex.store@2.x'
export const ROUTES_JSON_PATH = 'dist/vtex.store-indexer/build.json'

export const PAGE_TYPE_TO_STORE_ENTITIES = {
  Brand: 'brand',
  Category: 'category',
  Department: 'department',
  FullText: null,
  NotFound: null,
  Product: 'product',
  Search: null,
  SubCategory: 'subcategory',
}

export const PAGE_TYPES = {
  BRAND: 'brand',
  CATEGORY: 'category',
  DEPARTMENT: 'department',
  PRODUCT: 'product',
  PRODUCT_NOT_FOUND: 'notFoundProduct',
  SEARCH_NOT_FOUND: 'notFoundSearch',
  SUBCATEGORY: 'subcategory',
}

export interface ContentTypeDefinition {
  internal: string
  canonical: string
}

export type Routes = Record<string, ContentTypeDefinition>

type PageTypes = typeof PAGE_TYPES[keyof typeof PAGE_TYPES]

export const routeFormatter = async (apps: Apps, type: PageTypes) => {
  const routesJSON = await apps.getAppJSON<Routes>(
    STORE_LOCATOR,
    ROUTES_JSON_PATH
  )
  const route = routesJSON[type]
  const canonicalParser = new RouteParser(route.canonical)
  return (params?: Record<string, string | undefined> | null) => {
    const path = canonicalParser.reverse(params ?? {})
    if (!path) {
      throw new Error(`Parse error, params: ${params}, path: ${path}`)
    }
    return path
  }
}
