import { Category } from '@vtex/api/lib/clients/apps/catalogGraphQL/category'
import { InternalInput } from 'vtex.rewriter'

import { Context } from '../../typings/global'
import {
  getPath,
  INDEXED_ORIGIN,
  PAGE_TYPES,
  slugify,
  STORE_LOCATOR,
} from './utils'

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

const getInternal = (
  path: string,
  type: CategoryTypes,
  id: string,
  map: string
): InternalInput => ({
  declarer: STORE_LOCATOR,
  from: path,
  id,
  origin: INDEXED_ORIGIN,
  query: {
    map,
  },
  type: PAGE_TYPES[type],
})

const getNotFoundInternal = (path: string): InternalInput => ({
  declarer: STORE_LOCATOR,
  from: path,
  id: 'category',
  origin: INDEXED_ORIGIN,
  type: PAGE_TYPES.SEARCH_NOT_FOUND,
})

const internalsFromCategoryTree = async (
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

  const identifiedCategories = await internalsFromCategoryTree(
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
    vtex: { logger },
    state,
  } = ctx
  try {
    const category: Category = ctx.body
    const categoryTreeInternals = await internalsFromCategoryTree(category, ctx)

    const internals = await Promise.all(
      categoryTreeInternals.map(async identifiedCategory => {
        const { type, params, id, map, isActive } = identifiedCategory
        const path = await getPath(PAGE_TYPES[type], params, apps)
        return isActive
          ? getInternal(path, type, id, map)
          : getNotFoundInternal(path)
      })
    )

    state.internals = internals
  } catch (error) {
    logger.error(error)
  }

  await next()
}
