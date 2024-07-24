import { Brand } from 'vtex.catalog-graphql'
import { InternalInput } from 'vtex.rewriter'

import { Context } from '../../typings/global'
import { filterStoreBindings } from '../../utils/bindings'
import { deleteOldTranslation } from '../../utils/delete'
import {
  INDEXED_ORIGIN,
  PAGE_TYPES,
  processInternalAndOldRoute,
  routeFormatter,
  STORE_LOCATOR,
} from '../../utils/internals'
import { createTranslator } from '../../utils/messages'
import { slugify } from '../../utils/slugify'

type Params = Record<string, string | undefined> | null | undefined

const pathFromRoute = (formatRoute: (x: Params) => string, brand: string) =>
  formatRoute({ brand: slugify(brand).toLowerCase() })

export async function brandInternals(ctx: Context, next: () => Promise<void>) {
  const {
    clients: { apps, messages: messagesClient, rewriter },
    state: {
      tenantInfo: { defaultLocale: tenantLocale },
      tenantInfo,
      settings: { usesMultiLanguageSearch, resolveBrandMapQueryAs },
    },
    vtex: { logger },
  } = ctx
  const brand: Brand = ctx.body
  const { name, active, id } = brand
  const bindings = filterStoreBindings(tenantInfo)

  if (bindings.length === 0) {
    return
  }

  const formatRoute = await routeFormatter(apps, PAGE_TYPES.BRAND)
  const translate = createTranslator(messagesClient)
  const messages = [{ content: name, context: id, behavior: 'USER_ONLY'}]
  const tenantPath = pathFromRoute(formatRoute, name)

  const internalsAndOldRoutes = await Promise.all(
    bindings.map(async binding => {
      try {
        const { id: bindingId, defaultLocale: bindingLocale } = binding
        const [translated] = await translate(
          tenantLocale,
          bindingLocale,
          messages
        )
        const path = pathFromRoute(formatRoute, translated)
        const oldRoute = await deleteOldTranslation(
          id,
          'brand',
          bindingId,
          path,
          rewriter
        )

        const internal: InternalInput = {
          binding: bindingId,
          declarer: STORE_LOCATOR,
          from: path,
          id,
          origin: INDEXED_ORIGIN,
          query: active ? { map: resolveBrandMapQueryAs } : null,
          resolveAs: usesMultiLanguageSearch ? null : tenantPath,
          type: active ? PAGE_TYPES.BRAND : PAGE_TYPES.SEARCH_NOT_FOUND,
        }
        return {
          internal,
          oldRoute,
        }
      } catch (error) {
        logger.error({
          binding: binding.id,
          brand,
          error,
          message: 'Error creating category internals',
        })
        return null
      }
    })
  )

  const { internals, oldRoutes } = processInternalAndOldRoute(
    internalsAndOldRoutes
  )

  ctx.state.internals = internals
  ctx.state.oldRoutes = oldRoutes

  await next()
}
