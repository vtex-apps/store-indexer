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
import { deleteOldTranslation } from './delete'

type Params = Record<string, string | undefined> | null | undefined

const pathFromRoute = (formatRoute: (x: Params) => string, brand: string) =>
  formatRoute({ brand: slugify(brand).toLowerCase() })

export async function brandInternals(ctx: Context, next: () => Promise<void>) {
  const {
    clients: { apps, messages: messagesClient, rewriter },
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
  const translate = createTranslator(messagesClient)
  const messages = [{ content: name, context: id }]

  const tenantPath = pathFromRoute(formatRoute, name)

  const internals = await Promise.all(
    bindings.map(async binding => {
      const { id: bindingId, defaultLocale: bindingLocale } = binding
      const [translated] = await translate(
        tenantLocale,
        bindingLocale,
        messages
      )
      const path = pathFromRoute(formatRoute, translated)
      await deleteOldTranslation(id, 'brand', bindingId, rewriter)

      return {
        binding: bindingId,
        declarer: STORE_LOCATOR,
        from: path,
        id,
        origin: INDEXED_ORIGIN,
        query: active ? { map: 'b' } : null,
        resolveAs: tenantPath,
        type: active ? PAGE_TYPES.BRAND : PAGE_TYPES.SEARCH_NOT_FOUND,
      }
    })
  )

  ctx.state.internals = internals

  await next()
}
