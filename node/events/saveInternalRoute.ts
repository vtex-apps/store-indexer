import { Product } from 'vtex.catalog-graphql'
import { InternalInput } from 'vtex.rewriter'

import { ColossusEventContext } from '../typings/Colossus'

const STORE_LOCATOR = 'vtex.store@2.x'
const PRODUCT_TYPE = 'product'

const getProductInternal = (path: string, id: string): InternalInput => ({
  declarer: STORE_LOCATOR,
  from: path,
  id,
  type: PRODUCT_TYPE,
  // TODO ????? bindings?: Maybe<Array<Scalars['String']>>,
  // TODO ???? endDate?: Maybe<Scalars['Str/ing']>,
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

  const internal: InternalInput = getProductInternal(path, product.id)
  console.log('--INTERNAL', internal)
  await rewriterGraphql.saveInternal(internal).catch(err => { console.log('--ERROR', err) })

  await next()
}
