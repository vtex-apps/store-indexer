import { Brand } from 'vtex.catalog-graphql'

import { Context } from '../../typings/global'
import { filterStoreBindings } from '../../utils/bindings'
import {
  INDEXED_ORIGIN,
  PAGE_TYPES,
  routeFormatter,
  STORE_LOCATOR,
} from '../../utils/internals'
import { createTranslator } from '../../utils/messages'
import { slugify } from '../../utils/slugify'

export async function brandInternals(ctx: Context, next: () => Promise<void>) {
  const {
    clients: { apps, messagesGraphQL },
    state: {
      tenantInfo: { defaultLocale: tenantLocale },
      tenantInfo,
    },
  } = ctx
  const brand: Brand = ctx.body
  const { name, active, id } = brand
  const bindings = filterStoreBindings(tenantInfo)

  if (bindings.length === 0) {
    return
  }

  const formatRoute = await routeFormatter(apps, PAGE_TYPES.BRAND)
  const translate = createTranslator(messagesGraphQL)
  const messages = [{ content: name, context: id }]

  const internals = await Promise.all(
    bindings.map(async binding => {
      const { id: bindingId, defaultLocale: bindingLocale } = binding
      const [translated] = await translate(
        tenantLocale,
        bindingLocale,
        messages
      )
      const translatedSlug = slugify(translated).toLowerCase()
      const path = formatRoute({ brand: translatedSlug })

      return {
        binding: bindingId,
        declarer: STORE_LOCATOR,
        from: path,
        id,
        origin: INDEXED_ORIGIN,
        query: active ? { map: 'b' } : null,
        type: active ? PAGE_TYPES.BRAND : PAGE_TYPES.SEARCH_NOT_FOUND,
      }
    })
  )

  ctx.state.internals = internals

  await next()
}
