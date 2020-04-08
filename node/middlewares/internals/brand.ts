import { Brand } from 'vtex.catalog-graphql'

import { Context } from '../../typings/global'
import { filterStoreBindings } from '../../utils/bindings'
import {
  INDEXED_ORIGIN,
  PAGE_TYPES,
  routeFormatter,
  STORE_LOCATOR,
} from '../../utils/internals'
import { slugify } from '../../utils/slugify'

export async function brandInternals(ctx: Context, next: () => Promise<void>) {
  const {
    clients: { apps },
    state,
  } = ctx
  const brand: Brand = ctx.body
  const { name, active, id } = brand
  const brandName = slugify(name)
  const bindings = filterStoreBindings(ctx.state.tenantInfo)

  if (bindings.length === 0) {
    return
  }

  const formatRoute = await routeFormatter(apps, PAGE_TYPES.BRAND)

  const internals = await Promise.all(
    bindings.map(async binding => {
      const { defaultLocale, id: bindingId } = binding
      const translated = brandName
      const path = formatRoute({ brand: translated })

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

  state.internals = internals

  await next()
}
