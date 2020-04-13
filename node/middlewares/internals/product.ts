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

export async function productInternals(
  ctx: Context,
  next: () => Promise<void>
) {
  const {
    clients: { apps, messagesGraphQL },
    state: {
      tenantInfo: { defaultLocale: tenantLocale },
      tenantInfo,
    },
  } = ctx
  const product: Product = ctx.body
  const { linkId, isActive, id } = product
  const slug = linkId?.toLowerCase()
  const bindings = filterBindingsBySalesChannel(
    tenantInfo,
    product.salesChannel
  )

  if (!slug || bindings.length === 0) {
    return
  }

  const formatRoute = await routeFormatter(apps, PAGE_TYPES.PRODUCT)
  const translate = createTranslator(messagesGraphQL)
  const messages = [{ content: slug, context: id }]

  const internals = await Promise.all(
    bindings.map(async binding => {
      const { defaultLocale: bindingLocale, id: bindingId } = binding
      const [translated] = await translate(
        tenantLocale,
        bindingLocale,
        messages
      )
      const path = formatRoute({ slug: translated })

      return {
        binding: bindingId,
        declarer: STORE_LOCATOR,
        from: path,
        id,
        origin: INDEXED_ORIGIN,
        type: isActive ? PAGE_TYPES.PRODUCT : PAGE_TYPES.PRODUCT_NOT_FOUND,
      }
    })
  )

  ctx.state.internals = internals

  await next()
}
