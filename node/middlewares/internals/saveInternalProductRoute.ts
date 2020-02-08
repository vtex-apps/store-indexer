import { Product } from 'vtex.catalog-graphql'
import { InternalInput } from 'vtex.rewriter'

import { ColossusEventContext } from '../../typings/Colossus'
import {
  getBindings,
  getPath,
  INDEXED_ORIGIN,
  PAGE_TYPES,
  STORE_LOCATOR,
} from './utils'

const getProductInternal = (
  path: string,
  id: string,
  bindings: string[]
): InternalInput => ({
  bindings,
  declarer: STORE_LOCATOR,
  from: path,
  id,
  origin: INDEXED_ORIGIN,
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
    const path = await getPath(PAGE_TYPES.PRODUCT, { slug }, apps)
    const bindings = getBindings(ctx.state.tenantInfo, product.salesChannel)

    const internal: InternalInput = product.isActive
      ? getProductInternal(path, product.id, bindings)
      : getProductNotFoundInternal(path)

    await rewriterGraphql.saveInternal(internal)
  } catch (error) {
    logger.error(error)
  }

  await next()
}
