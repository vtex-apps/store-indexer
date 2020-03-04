import { Product } from 'vtex.catalog-graphql'
import { Internal, InternalInput } from 'vtex.rewriter'

import { ColossusEventContext } from '../../typings/Colossus'
import {
  getBindings,
  getPath,
  INDEXED_ORIGIN,
  PAGE_TYPES,
  slugify,
  STORE_LOCATOR,
} from './utils'
import { values } from 'ramda'

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
  origin: INDEXED_ORIGIN,
  type: PAGE_TYPES.PRODUCT_NOT_FOUND,
})

export async function saveInternalProductRoute(
  ctx: ColossusEventContext,
  next: () => Promise<void>
) {
  const {
    clients: { apps, rewriterGraphql, messagesGraphQL },
    state: {
      resources: { idUrlIndex },
    },
    vtex: { logger },
  } = ctx
  try {
    const product: Product = ctx.body
    const slug = product.linkId?.toLowerCase()
    const path = await getPath(PAGE_TYPES.PRODUCT, { slug }, apps)
    const bindings = getBindings(ctx.state.tenantInfo, product.salesChannel)

    if (!bindings) {
      const starBinding = ['*']
      const internal: InternalInput = product.isActive
        ? getProductInternal(path, product.id, starBinding)
        : getProductNotFoundInternal(path)
      await Promise.all([
        rewriterGraphql.saveInternal(internal),
        idUrlIndex.save(product.id, path, starBinding),
      ])
      return
    }
    const indexedByFrom = [
      {
        from: ctx.vtex.tenant!.locale,
        messages: [
          {
            content: path.split('/')[1],
          },
        ],
      },
    ]

    const rawInternals = await Promise.all(
      bindings.map(async binding => {
        const translatedPath = `/${await messagesGraphQL
          .translateV2({
            indexedByFrom,
            to: binding.defaultLocale,
          })
          .then(res => slugify(res[0]))}/p`
        const internal: InternalInput = product.isActive
          ? getProductInternal(translatedPath, product.id, [binding.id])
          : getProductNotFoundInternal(translatedPath)

        return internal
      })
    )

    // Avoid overrides merges internals with same path but different bindings
    const internals = values(
      rawInternals.reduce((acc, internal) => {
        const { from } = internal
        if (acc[from]) {
          acc[from].bindings = acc[from].bindings!.concat(internal.bindings!)
          return acc
        }
        acc[from] = internal
        return acc
      }, {} as Record<string, Internal>)
    )

    await Promise.all([
      rewriterGraphql.saveManyInternals(internals),
      ...internals.map(internal =>
        idUrlIndex.save(product.id, internal.from, internal.bindings!)
      ),
    ])
  } catch (error) {
    logger.error(error)
  }

  await next()
}
