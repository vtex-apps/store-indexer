import { Category } from '@vtex/api/lib/clients/apps/catalogGraphQL/category'

import { Context } from '../../typings/global'
import { filterStoreBindings } from '../../utils/bindings'
import {
  INDEXED_ORIGIN,
  PAGE_TYPES,
  routeFormatter,
  STORE_LOCATOR,
} from '../../utils/internals'
import { slugify } from '../../utils/slugify'

type CategoryTypes = 'DEPARTMENT' | 'CATEGORY' | 'SUBCATEGORY'

interface IdentifiedCategory extends Category {
  parentsNames: string[]
}

const getCategoryType = (
  categoryTree: string[]
): { type: CategoryTypes; map: string; params: Record<string, string> } => {
  const height = categoryTree.length
  const slugifiedCategoryTree = categoryTree.map(slugify)
  switch (height) {
    case 1:
      return {
        map: 'c',
        params: {
          department: slugifiedCategoryTree[0],
        },
        type: 'DEPARTMENT',
      }
    case 2:
      return {
        map: 'c,c',
        params: {
          category: slugifiedCategoryTree[1],
          department: slugifiedCategoryTree[0],
        },
        type: 'CATEGORY',
      }
    default:
      return {
        map: Array(height)
          .fill('c')
          .join(','),
        params: {
          category: slugifiedCategoryTree[1],
          department: slugifiedCategoryTree[0],
          subcategory: slugifiedCategoryTree[2],
          terms: slugifiedCategoryTree.slice(3).join('/'),
        },
        type: 'SUBCATEGORY',
      }
  }
}

export async function categoryInternals(
  ctx: Context,
  next: () => Promise<void>
) {
  const {
    clients: { apps },
    state,
  } = ctx
  const category: IdentifiedCategory = ctx.body
  const bindings = filterStoreBindings(ctx.state.tenantInfo)

  if (bindings.length === 0) {
    return
  }
  const { id, isActive, name, parentsNames } = category
  const { map, type, params } = getCategoryType([...parentsNames, name])
  const pageType = PAGE_TYPES[type]
  const formatRoute = await routeFormatter(apps, pageType)
  const internals = bindings.map(binding => {
    const { id: bindingId } = binding
    const translatedParams = params
    const path = formatRoute(translatedParams)

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

  state.internals = internals

  await next()
}
