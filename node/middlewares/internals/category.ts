import { Category } from '@vtex/api/lib/clients/apps/catalogGraphQL/category'

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
        map: Array(height)
          .fill('c')
          .join(','),
        type: 'SUBCATEGORY',
      }
  }
}

const toParams = ([department, category, subcategory, ...terms]: string[]) => ({
  category: category ? slugify(category).toLowerCase() : undefined,
  department: department ? slugify(department).toLowerCase() : undefined,
  subcategory: subcategory ? slugify(subcategory).toLowerCase() : undefined,
  terms: terms.map(term => slugify(term)).join('/'),
})

export async function categoryInternals(
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
  const translate = createTranslator(messagesGraphQL)

  const internals = await Promise.all(
    bindings.map(async binding => {
      const { id: bindingId, defaultLocale: bindingLocale } = binding
      const translatedTree = await translate(
        tenantLocale,
        bindingLocale,
        messages
      )
      const params = toParams(translatedTree)
      const path = formatRoute(params)

      return {
        binding: bindingId,
        declarer: STORE_LOCATOR,
        from: path,
        id,
        origin: INDEXED_ORIGIN,
        query: isActive ? { map } : null,
        type: isActive ? pageType : PAGE_TYPES.SEARCH_NOT_FOUND,
      }
    })
  )

  ctx.state.internals = internals

  await next()
}
