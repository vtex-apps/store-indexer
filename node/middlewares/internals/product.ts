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
  const bindings = filterBindingsBySalesChannel(
    tenantInfo,
    product.salesChannel
  )

  if (!linkId || bindings.length === 0) {
    return
  }

  const formatRoute = await routeFormatter(apps, PAGE_TYPES.PRODUCT)
  const translate = createTranslator(messagesGraphQL)
  const messages = [{ content: linkId, context: id }]

  const internals = await Promise.all(
    bindings.map(async binding => {
      const { defaultLocale: bindingLocale, id: bindingId } = binding
      const [translated] = await translate(
        tenantLocale,
        bindingLocale,
        messages
      )
      const translatedSlug = slugify(translated).toLowerCase()
      const path = formatRoute({ slug: translatedSlug })

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
