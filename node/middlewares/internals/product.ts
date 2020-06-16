import { Product } from 'vtex.catalog-graphql'

import { Context } from '../../typings/global'
import { filterBindingsBySalesChannel } from '../../utils/bindings'
import {
  INDEXED_ORIGIN,
  PAGE_TYPES,
  routeFormatter,
  STORE_LOCATOR,
} from '../../utils/internals'
import { createTranslator } from '../../utils/messages'
import { slugify } from '../../utils/slugify'
import { deleteOldTranslation } from './delete'

type Params = Record<string, string | undefined> | null | undefined

const pathFromRoute = (formatRoute: (x: Params) => string, slug: string) =>
  formatRoute({ slug: slugify(slug).toLowerCase() })

export async function productInternals(
  ctx: Context,
  next: () => Promise<void>
) {
  const {
    clients: { apps, messages: messagesClient, rewriter },
    state: {
      tenantInfo: { defaultLocale: tenantLocale },
      tenantInfo,
    },
  } = ctx
  const product: Product = ctx.body
  const { linkId, isActive, id } = product
  const bindings = filterBindingsBySalesChannel(
    tenantInfo,
    product.salesChannel
  )

  if (!linkId || bindings.length === 0) {
    return
  }

  const formatRoute = await routeFormatter(apps, PAGE_TYPES.PRODUCT)
  const translate = createTranslator(messagesClient)
  const messages = [{ content: linkId, context: id }]

  const tenantPath = pathFromRoute(formatRoute, linkId)

  const internals = await Promise.all(
    bindings.map(async binding => {
      const { defaultLocale: bindingLocale, id: bindingId } = binding
      const [translated] = await translate(
        tenantLocale,
        bindingLocale,
        messages
      )
      const path = pathFromRoute(formatRoute, translated)
      await deleteOldTranslation(id, 'product', bindingId, rewriter)

      return {
        binding: bindingId,
        declarer: STORE_LOCATOR,
        from: path,
        id,
        origin: INDEXED_ORIGIN,
        resolveAs: tenantPath,
        type: isActive ? PAGE_TYPES.PRODUCT : PAGE_TYPES.PRODUCT_NOT_FOUND,
      }
    })
  )

  ctx.state.internals = internals

  await next()
}
