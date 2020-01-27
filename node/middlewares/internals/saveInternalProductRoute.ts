import RouteParser from 'route-parser'
import { Product } from 'vtex.catalog-graphql'
import { InternalInput } from 'vtex.rewriter'

import { ColossusEventContext } from '../../typings/Colossus'
import {
  PAGE_TYPES,
  Routes,
  ROUTES_JSON_PATH,
  STORE_LOCATOR,
  tenMinutesFromNowMS,
} from './utils'

const getProductInternal = (path: string, id: string): InternalInput => ({
  declarer: STORE_LOCATOR,
  endDate: tenMinutesFromNowMS(),
  from: path,
  id,
  type: PAGE_TYPES.PRODUCT,
})

const getProductNotFoundInternal = (path: string): InternalInput => ({
  declarer: STORE_LOCATOR,
  from: path,
  id: 'product',
  type: PAGE_TYPES.PRODUCT_NOT_FOUND,
})

export async function saveInternalProductRoute(
  ctx: ColossusEventContext,
  next: () => Promise<any>
) {
  const {
    clients: { apps, rewriterGraphql },
    vtex: { logger },
  } = ctx
  try {
    const product: Product = ctx.body
    const slug = product.linkId?.toLowerCase()
    const routesJSON = await apps.getAppJSON<Routes>(
      STORE_LOCATOR,
      ROUTES_JSON_PATH
    )
    const productRoute = routesJSON[PAGE_TYPES.PRODUCT]
    const canonicalParser = new RouteParser(productRoute.canonical)
    const path = canonicalParser.reverse({ slug })
    if (!path) {
      throw new Error(`Parse error, params: ${{ slug }}, path: ${path}`)
    }

    const internal: InternalInput = product.isActive
      ? getProductInternal(path, product.id)
      : getProductNotFoundInternal(path)

    await rewriterGraphql.saveInternal(internal)
  } catch (error) {
    logger.error(error)
  }

  await next()
}
