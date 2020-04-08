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

interface IdentifiedCategory {
  type: CategoryTypes
  map: string
  id: string
  params: {
    department?: string
    category?: string
    subcategory?: string
    terms?: string
  }
  isActive: boolean
}

const categoriesFromCategoryTree = async (
  category: Category,
  ctx: Context
): Promise<IdentifiedCategory[]> => {
  const { catalogGraphQL } = ctx.clients
  const { parentCategoryId, name } = category

  if (!parentCategoryId) {
    const identifiedCategory: IdentifiedCategory = {
      id: category.id,
      isActive: category.isActive,
      map: 'c',
      params: {
        department: slugify(name),
      },
      type: 'DEPARTMENT',
    }
    return [identifiedCategory]
  }

  const parentCategory = await catalogGraphQL
    .category(parentCategoryId)
    .then(res => res!.category)

  const identifiedCategories = await categoriesFromCategoryTree(
    parentCategory,
    ctx
  )
  const { type, params, map } = identifiedCategories[0]

  if (type === 'DEPARTMENT') {
    const identifiedCategory: IdentifiedCategory = {
      id: category.id,
      isActive: category.isActive,
      map: `${map},c`,
      params: {
        ...params,
        category: slugify(name),
      },
      type: 'CATEGORY',
    }
    return [identifiedCategory, ...identifiedCategories]
  }
  if (type === 'CATEGORY') {
    const identifiedCategory: IdentifiedCategory = {
      id: category.id,
      isActive: category.isActive,
      map: `${map},c`,
      params: {
        ...params,
        subcategory: slugify(name),
      },
      type: 'SUBCATEGORY',
    }
    return [identifiedCategory, ...identifiedCategories]
  }
  const identifiedCategory = {
    id: category.id,
    isActive: category.isActive,
    map: `${map},c`,
    params: {
      ...params,
      terms: params.terms ? `${params.terms}${slugify(name)}` : slugify(name),
    },
    type,
  }
  return [identifiedCategory, ...identifiedCategories]
}

export async function categoryInternals(
  ctx: Context,
  next: () => Promise<void>
) {
  const {
    clients: { apps },
    state,
  } = ctx
  const category: Category = ctx.body
  const bindings = filterStoreBindings(ctx.state.tenantInfo)

  if (bindings.length === 0) {
    return
  }

  const categories = await categoriesFromCategoryTree(category, ctx)

  const internals = await Promise.all(
    categories.map(async cat => {
      const { type, params, id, isActive, map } = cat
      const pageType = PAGE_TYPES[type]
      const formatRoute = await routeFormatter(apps, pageType)
      return bindings.map(binding => {
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
    })
  )

  state.internals = internals.flat()

  await next()
}
