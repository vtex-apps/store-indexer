import { Apps, Binding, Tenant } from '@vtex/api'
import RouteParser from 'route-parser'
import { Maybe, SalesChannel } from 'vtex.catalog-graphql'

export const INDEXED_ORIGIN = 'vtex.store-indexer@0.x:routes-indexing'
export const STORE_LOCATOR = 'vtex.store@2.x'
export const ROUTES_JSON_PATH = 'dist/vtex.store-indexer/build.json'

export const PAGE_TYPE_TO_STORE_ENTITIES = {
  'Brand': 'brand',
  'Category': 'category',
  'Department': 'department',
  'FullText': null,
  'NotFound': null,
  'Product': 'product',
  'Search': null,
  'SubCategory': 'subcategory',
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

export const slugify = (str: string) =>
  str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[*+~.()'"!:@&\[\]`,/ %$#?{}|><=_^]/g, '-')

export interface ContentTypeDefinition {
  internal: string
  canonical: string
}

export type Routes = Record<string, ContentTypeDefinition>

type PageTypes = typeof PAGE_TYPES[keyof typeof PAGE_TYPES]

export const getPath = async (
  type: PageTypes,
  params: any,
  apps: Apps
): Promise<string> => {
  const routesJSON = await apps.getAppJSON<Routes>(
    STORE_LOCATOR,
    ROUTES_JSON_PATH
  )
  const route = routesJSON[type]
  const canonicalParser = new RouteParser(route.canonical)

  const path = canonicalParser.reverse(params)
  if (!path) {
    throw new Error(`Parse error, params: ${params}, path: ${path}`)
  }
  return path
}

export const getBindings = (
  tenantInfo: Tenant | undefined,
  salesChannels: Array<Maybe<SalesChannel>> | null | undefined
): string[] => {
  if (!tenantInfo || !salesChannels || salesChannels.length === 0) {
    return ['*']
  }
  const mapSalesChannelToBindingId = tenantInfo.bindings.reduce(
    (acc: Record<string, string>, { id, extraContext }: Binding) => {
      const salesChannelId = extraContext.portal?.salesChannel
      if (salesChannelId) {
        acc[salesChannelId] = id
      }
      return acc
    },
    {} as Record<string, string>
  )

  return salesChannels.reduce((acc, salesChannel) => {
    if (salesChannel) {
      acc.push(mapSalesChannelToBindingId[salesChannel.id])
    }
    return acc
  }, [] as string[])
}
