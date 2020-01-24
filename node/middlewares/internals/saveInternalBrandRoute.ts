import RouteParser from 'route-parser'
import { Brand } from 'vtex.catalog-graphql'
import { InternalInput } from 'vtex.rewriter'

import { ColossusEventContext } from '../../typings/Colossus'
import { PAGE_TYPES, ROUTES_JSON_PATH, slugify, STORE_LOCATOR } from './utils'

interface ContentTypeDefinition {
  internal: string
  canonical: string
}

const getBrandInternal = (path: string, id: string): InternalInput => ({
  declarer: STORE_LOCATOR,
  from: path,
  id,
  query: {
    map: 'b',
  },
  type: PAGE_TYPES.BRAND,
  // TODO ????? bindings?: Maybe<Array<Scalars['String']>>,
  // TODO ???? endDate?: Maybe<Scalars['Str/ing']>,
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
    const brand: Brand = ctx.body.data
    const brandName = slugify(brand.name)
    const routesJSON = (await apps.getAppJSON(
      STORE_LOCATOR,
      ROUTES_JSON_PATH
    )) as Record<string, ContentTypeDefinition>
    const brandRoute = routesJSON[PAGE_TYPES.BRAND]
    const canonicalParser = new RouteParser(brandRoute.canonical)
    const path = canonicalParser.reverse({ brand: brandName })

    const internal: InternalInput = getBrandInternal(path, brand.id)

    await rewriterGraphql.saveInternal(internal)
  } catch (error) {
    logger.error(error)
  }

  await next()
}
