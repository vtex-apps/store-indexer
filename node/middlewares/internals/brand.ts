import { Brand } from 'vtex.catalog-graphql'
import { InternalInput } from 'vtex.rewriter'

import { Context } from '../../typings/global'
import {
  filterBindings,
  getPath,
  INDEXED_ORIGIN,
  PAGE_TYPES,
  slugify,
  STORE_LOCATOR,
} from './utils'

const getBrandInternals = (
  path: string,
  id: string,
  bindings: string[]
): InternalInput[] =>
  bindings.map(binding => ({
    binding,
    declarer: STORE_LOCATOR,
    from: path,
    id,
    origin: INDEXED_ORIGIN,
    query: {
      map: 'b',
    },
    type: PAGE_TYPES.BRAND,
  }))

const getBrandNotFoundInternals = (
  path: string,
  bindings: string[]
): InternalInput[] =>
  bindings.map(binding => ({
    binding,
    declarer: STORE_LOCATOR,
    from: path,
    id: 'brand',
    origin: INDEXED_ORIGIN,
    type: PAGE_TYPES.SEARCH_NOT_FOUND,
  }))

export async function brandInternals(ctx: Context, next: () => Promise<void>) {
  const {
    clients: { apps },
    vtex: { logger },
    state,
  } = ctx
  try {
    const bindings = filterBindings(ctx.state.tenantInfo, null)
    const brand: Brand = ctx.body
    const brandName = slugify(brand.name)
    const path = await getPath(PAGE_TYPES.BRAND, { brand: brandName }, apps)

    const internals = brand.active
      ? getBrandInternals(path, brand.id, bindings)
      : getBrandNotFoundInternals(path, bindings)

    state.internals = internals
  } catch (error) {
    logger.error(error)
  }

  await next()
}
