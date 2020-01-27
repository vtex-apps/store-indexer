import RouteParser from 'route-parser'
import { Brand } from 'vtex.catalog-graphql'
import { InternalInput } from 'vtex.rewriter'

import { ColossusEventContext } from '../../typings/Colossus'
import {
  PAGE_TYPES,
  Routes,
  ROUTES_JSON_PATH,
  slugify,
  STORE_LOCATOR,
  tenMinutesFromNowMS,
} from './utils'

const getBrandInternal = (path: string, id: string): InternalInput => ({
  declarer: STORE_LOCATOR,
  endDate: tenMinutesFromNowMS(),
  from: path,
  id,
  query: {
    map: 'b',
  },
  type: PAGE_TYPES.BRAND,
})

export async function saveInternalBrandRoute(
  ctx: ColossusEventContext,
  next: () => Promise<any>
) {
  const {
    clients: { apps, rewriterGraphql },
    vtex: { logger },
  } = ctx
  try {
    const brand: Brand = ctx.body
    const brandName = slugify(brand.name)
    const routesJSON = await apps.getAppJSON<Routes>(
      STORE_LOCATOR,
      ROUTES_JSON_PATH
    )
    const brandRoute = routesJSON[PAGE_TYPES.BRAND]
    const canonicalParser = new RouteParser(brandRoute.canonical)
    const path = canonicalParser.reverse({ brand: brandName })
    if (!path) {
      throw new Error(
        `Parse error, params: ${{ brand: brandName }}, path: ${path}`
      )
    }

    const internal: InternalInput = getBrandInternal(path, brand.id)

    await rewriterGraphql.saveInternal(internal)
  } catch (error) {
    logger.error(error)
  }

  await next()
}
