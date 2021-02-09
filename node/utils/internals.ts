/* eslint-disable no-useless-escape */
import { Apps } from '@vtex/api'
import RouteParser from 'route-parser'
import { InternalInput, RouteLocator } from 'vtex.rewriter'

export const INDEXED_ORIGIN = `${process.env.VTEX_APP_ID!}:routes-indexing`
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

export interface InternalAndOldRoute {
  internal: InternalInput
  oldRoute: RouteLocator | null
}

export type Routes = Record<string, ContentTypeDefinition>

type PageTypes = typeof PAGE_TYPES[keyof typeof PAGE_TYPES]

export const routeFormatter = async (apps: Apps, type: PageTypes) => {
  const routesJSON = await apps.getAppJSON<Routes>(
    STORE_LOCATOR,
    ROUTES_JSON_PATH
  )
  routesJSON.subcategory.canonical =
    '/:department/:category/:subcategory(/*terms)'
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

export const processInternalAndOldRoute = (
  internalsAndOldRoutes: Array<InternalAndOldRoute | null>
) => {
  return internalsAndOldRoutes.reduce(
    (acc, data) => {
      if (data === null) {
        return acc
      }
      const { internal, oldRoute } = data
      acc.internals.push(internal)
      if (oldRoute) {
        acc.oldRoutes.push(oldRoute)
      }
      return acc
    },
    { internals: [] as InternalInput[], oldRoutes: [] as RouteLocator[] }
  )
}
