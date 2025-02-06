import { Product } from 'vtex.catalog-graphql'
import { InternalInput } from 'vtex.rewriter'

import { Context } from '../../typings/global'
import { filterBindingsBySalesChannel } from '../../utils/bindings'
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
      settings: { usesMultiLanguageSearch },
    },
    vtex: { logger },
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

  const internalsAndOldRoutes = await Promise.all(
    bindings.map(async binding => {
      try {
        const { defaultLocale: bindingLocale, id: bindingId } = binding
        const [translated] = await translate(
          tenantLocale,
          bindingLocale,
          messages
        )
        const path = pathFromRoute(formatRoute, translated)
        const oldRoute = await deleteOldTranslation(
          id,
          'product',
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
          resolveAs: usesMultiLanguageSearch ? null : tenantPath,
          type: isActive ? PAGE_TYPES.PRODUCT : PAGE_TYPES.PRODUCT_NOT_FOUND,
        }

        return {
          internal,
          oldRoute,
        }
      } catch (error) {
        logger.error({
          binding: binding.id,
          error,
          message: 'Error creating category internals',
          product,
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
