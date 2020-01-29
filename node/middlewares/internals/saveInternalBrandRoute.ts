import { Brand } from 'vtex.catalog-graphql'
import { InternalInput } from 'vtex.rewriter'

import { ColossusEventContext } from '../../typings/Colossus'
import {
  getPath,
  PAGE_TYPES,
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
    vtex: { logger, binding },
  } = ctx
  try {
    const brand: Brand = ctx.body
    const brandName = slugify(brand.name)
    const path = await getPath(PAGE_TYPES.BRAND, { brand: brandName }, apps)

    const internal: InternalInput = getBrandInternal(path, brand.id)

    if (binding && binding.id) {
      internal.bindings = [binding.id]
    }

    await rewriterGraphql.saveInternal(internal)
  } catch (error) {
    logger.error(error)
  }

  await next()
}
