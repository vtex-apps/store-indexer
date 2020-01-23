import { Product } from 'vtex.catalog-graphql'
import { InternalInput } from 'vtex.rewriter'

import { ColossusEventContext } from '../typings/Colossus'

const STORE_LOCATOR = 'vtex.store@2.x'
const PRODUCT_TYPE = 'product'
const PRODUCT_NOT_FOUND_TYPE = 'notFound'

const getProductInternal = (path: string, id: string): InternalInput => ({
  declarer: STORE_LOCATOR,
  from: path,
  id,
  type: PRODUCT_TYPE,
  // TODO ????? bindings?: Maybe<Array<Scalars['String']>>,
  // TODO ???? endDate?: Maybe<Scalars['Str/ing']>,
})

const getProductNotFoundInternal = (path: string): InternalInput => ({
  declarer: STORE_LOCATOR,
  from: path,
  id: 'product',
  type: PRODUCT_NOT_FOUND_TYPE,
})

export async function saveInternalProductRoute(
  ctx: ColossusEventContext,
  next: () => Promise<any>
) {
  const {
    clients: { rewriterGraphql },
  } = ctx
  console.log('---body', ctx.body)
  const product: Product = ctx.body.data
  const slug = product.linkId?.toLocaleLowerCase()

  // TODO Get from store and interpolate with canonical
  const path = `/${slug}/p`

  const internal: InternalInput = product.isActive
    ? getProductInternal(path, product.id)
    : getProductNotFoundInternal(path)

  await rewriterGraphql.saveInternal(internal)

  await next()
}
