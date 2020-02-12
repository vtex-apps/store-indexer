import { Apps, Binding, Tenant } from '@vtex/api'
import RouteParser from 'route-parser'
import { Maybe, SalesChannel } from 'vtex.catalog-graphql'

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

const ONE_SECOND = 1000
const ONE_MINUTE = 60 * ONE_SECOND
const ONE_HOUR = 60 * ONE_MINUTE
const ONE_DAY = 24 * ONE_HOUR

export const OneMonthFromNowMS = () => `${new Date(Date.now() + 30 * ONE_DAY)}`

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
