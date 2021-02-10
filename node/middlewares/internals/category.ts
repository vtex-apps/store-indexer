import { Category } from '@vtex/api/lib/clients/apps/catalogGraphQL/category'
import { InternalInput } from 'vtex.rewriter'

import { Context } from '../../typings/global'
import { filterStoreBindings } from '../../utils/bindings'
import { deleteOldTranslation } from '../../utils/delete'
import {
  INDEXED_ORIGIN,
  InternalAndOldRoute,
  PAGE_TYPES,
  processInternalAndOldRoute,
  routeFormatter,
  STORE_LOCATOR,
} from '../../utils/internals'
import { createTranslator } from '../../utils/messages'
import { slugify } from '../../utils/slugify'

type CategoryTypes = 'DEPARTMENT' | 'CATEGORY' | 'SUBCATEGORY'

interface IdentifiedCategory extends Category {
  parents: Array<Pick<Category, 'name' | 'id'>>
}

const getCategoryType = (
  parents: IdentifiedCategory['parents']
): { type: CategoryTypes; map: string } => {
  const height = parents.length
  switch (height) {
    case 0:
      return {
        map: 'c',
        type: 'DEPARTMENT',
      }
    case 1:
      return {
        map: 'c,c',
        type: 'CATEGORY',
      }
    default:
      return {
        map: Array(height + 1)
          .fill('c')
          .join(','),
        type: 'SUBCATEGORY',
      }
  }
}

const toParams = ([department, category, subcategory, ...terms]: string[]) => ({
  category,
  department,
  subcategory,
  terms: terms.join('/'),
})

type Params = ReturnType<typeof toParams>

const pathFromTree = (formatRoute: (x: Params) => string, tree: string[]) =>
  formatRoute(toParams(tree.map(x => slugify(x).toLowerCase())))

export async function categoryInternals(
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
  const category: IdentifiedCategory = ctx.body
  const bindings = filterStoreBindings(tenantInfo)

  if (bindings.length === 0) {
    return
  }

  const { id, isActive, name, parents } = category
  const { map, type } = getCategoryType(parents)
  const pageType = PAGE_TYPES[type]
  const messages = [...parents, { id, name }].map(c => ({
    content: c.name,
    context: c.id,
  }))

  const formatRoute = await routeFormatter(apps, pageType)
  const translate = createTranslator(messagesClient)

  const tenantPath = pathFromTree(
    formatRoute,
    messages.map(x => x.content)
  )

  const internalsAndOldRoutes = await Promise.all(
    bindings.map(async binding => {
      try {
        const { id: bindingId, defaultLocale: bindingLocale } = binding
        const translatedTree = await translate(
          tenantLocale,
          bindingLocale,
          messages
        )
        const path = pathFromTree(formatRoute, translatedTree)
        const oldRoute = await deleteOldTranslation(
          id,
          pageType,
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
          query: isActive ? { map } : null,
          resolveAs: usesMultiLanguageSearch ? null : tenantPath,
          type: isActive ? pageType : PAGE_TYPES.SEARCH_NOT_FOUND,
        }
        return {
          internal,
          oldRoute,
        } as InternalAndOldRoute
      } catch (error) {
        logger.error({
          binding: binding.id,
          category,
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
