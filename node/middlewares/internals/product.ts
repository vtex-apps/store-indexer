import { Product } from 'vtex.catalog-graphql'
import { InternalInput } from 'vtex.rewriter'

import { Context } from '../../typings/global'
import {
  filterBindings,
  getPath,
  INDEXED_ORIGIN,
  PAGE_TYPES,
  STORE_LOCATOR,
} from './utils'

const getProductInternal = (
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
    type: PAGE_TYPES.PRODUCT,
  }))

const getProductNotFoundInternal = (path: string): InternalInput[] => [
  {
    declarer: STORE_LOCATOR,
    from: path,
    id: 'product',
    origin: INDEXED_ORIGIN,
    type: PAGE_TYPES.PRODUCT_NOT_FOUND,
  },
]

export async function productInternals(
  ctx: Context,
  next: () => Promise<void>
) {
  const {
    clients: { apps },
    vtex: { logger },
    state,
  } = ctx
  try {
    const product: Product = ctx.body
    const slug = product.linkId?.toLowerCase()
    const path = await getPath(PAGE_TYPES.PRODUCT, { slug }, apps)
    const bindings = filterBindings(ctx.state.tenantInfo, product.salesChannel)

    const internals =
      product.isActive && bindings.length > 0
        ? getProductInternal(path, product.id, bindings)
        : getProductNotFoundInternal(path)

    state.internals = internals
  } catch (error) {
    logger.error(error)
  }

  await next()
}
