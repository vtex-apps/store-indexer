import { Apps } from '@vtex/api'
import { Category } from '@vtex/api/lib/clients/apps/catalogGraphQL/category'
import { InternalInput } from 'vtex.rewriter'

import { Context } from '../../typings/global'
import {
  filterBindings,
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

const getInternals = (
  path: string,
  type: CategoryTypes,
  id: string,
  map: string,
  bindings: string[]
): InternalInput[] =>
  bindings.map(binding => ({
    binding,
    declarer: STORE_LOCATOR,
    from: path,
    id,
    origin: INDEXED_ORIGIN,
    query: {
      map,
    },
    type: PAGE_TYPES[type],
  }))

const getNotFoundInternals = (
  path: string,
  bindings: string[]
): InternalInput[] =>
  bindings.map(binding => ({
    binding,
    declarer: STORE_LOCATOR,
    from: path,
    id: 'category',
    origin: INDEXED_ORIGIN,
    type: PAGE_TYPES.SEARCH_NOT_FOUND,
  }))

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

const addPathToCategoryTreeInternals = (
  apps: Apps,
  categories: IdentifiedCategory[]
) =>
  Promise.all(
    categories.map(async category => {
      const { type, params } = category
      const path = await getPath(PAGE_TYPES[type], params, apps)
      return {
        ...category,
        path,
      }
    })
  )

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
    const bindings = filterBindings(ctx.state.tenantInfo, null)
    const category: Category = ctx.body
    const categoryTreeInternals = await internalsFromCategoryTree(category, ctx)
    const categoryTreeInternalsWithPath = await addPathToCategoryTreeInternals(
      apps,
      categoryTreeInternals
    )

    const internals = categoryTreeInternalsWithPath.flatMap(
      ({ type, id, map, isActive, path }) =>
        isActive
          ? getInternals(path, type, id, map, bindings)
          : getNotFoundInternals(path, bindings)
    )

    state.internals = internals
  } catch (error) {
    logger.error(error)
  }

  await next()
}
