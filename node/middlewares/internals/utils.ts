import { Apps } from '@vtex/api'
import RouteParser from 'route-parser'
import { Maybe, SalesChannel } from 'vtex.catalog-graphql'

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
  ['PRODUCT_NOT_FOUND']: 'notFoundProduct',
}

export const slugify = (str: string) =>
  str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')

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
  tenantInfo: any,
  salesChannels: Array<Maybe<SalesChannel>> | null | undefined
): string[] => {
  if (!tenantInfo.bindings || !salesChannels || salesChannels.length === 0) {
    return ['*']
  }
  const mapSalesChannelToBindingId = tenantInfo.bindings.reduce(
    (acc: Record<string, string>, { id, extraContext }: any) => {
      const salesChannelId = extraContext.portal?.salesChannel
      if (salesChannelId) {
        acc[salesChannelId] = id
      }
      return acc
    },
    {} as Record<string, string>
  )

  return salesChannels.map(
    salesChannel => salesChannel && mapSalesChannelToBindingId[salesChannel.id]
  )
}
