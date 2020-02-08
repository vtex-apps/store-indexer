import { Brand } from 'vtex.catalog-graphql'
import { InternalInput } from 'vtex.rewriter'

import { ColossusEventContext } from '../../typings/Colossus'
import {
  getPath,
  INDEXED_ORIGIN,
  PAGE_TYPES,
  slugify,
  STORE_LOCATOR,
} from './utils'

const getBrandInternal = (path: string, id: string): InternalInput => ({
  declarer: STORE_LOCATOR,
  from: path,
  id,
  query: {
    map: 'b',
  },
  origin: INDEXED_ORIGIN,
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
    const path = await getPath(PAGE_TYPES.BRAND, { brand: brandName }, apps)

    const internal: InternalInput = getBrandInternal(path, brand.id)

    await rewriterGraphql.saveInternal(internal)
  } catch (error) {
    logger.error(error)
  }

  await next()
}
