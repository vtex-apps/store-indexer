import { Brand } from 'vtex.catalog-graphql'
import { InternalInput } from 'vtex.rewriter'

import { ColossusEventContext } from '../../typings/Colossus'
import {
  getPath,
  INDEXED_ORIGIN,
  OneMonthFromNowMS,
  PAGE_TYPES,
  slugify,
  STORE_LOCATOR,
} from './utils'

const getBrandInternal = (path: string, id: string): InternalInput => ({
  declarer: STORE_LOCATOR,
  from: path,
  id,
  origin: INDEXED_ORIGIN,
  query: {
    map: 'b',
  },
  type: PAGE_TYPES.BRAND,
})

const getBrandNotFoundInternal = (path: string): InternalInput => ({
  declarer: STORE_LOCATOR,
  endDate: OneMonthFromNowMS(),
  from: path,
  id: 'brand',
  origin: INDEXED_ORIGIN,
  type: PAGE_TYPES.SEARCH_NOT_FOUND,
})

export async function saveInternalBrandRoute(
  ctx: ColossusEventContext,
  next: () => Promise<void>
) {
  const {
    clients: { apps, rewriterGraphql },
    state: {
      resources: { idUrlIndex },
    },
    vtex: { logger },
  } = ctx
  try {
    const brand: Brand = ctx.body
    const brandName = slugify(brand.name)
    const path = await getPath(PAGE_TYPES.BRAND, { brand: brandName }, apps)

    const internal: InternalInput = brand.active
      ? getBrandInternal(path, brand.id)
      : getBrandNotFoundInternal(path)

    await Promise.all([
      rewriterGraphql.saveInternal(internal),
      idUrlIndex.save(brand.id, path),
    ])
  } catch (error) {
    logger.error(error)
  }

  await next()
}
