import { Category } from '@vtex/api/lib/clients/apps/catalogGraphQL/category'
import { InternalInput } from 'vtex.rewriter'

import { Clients } from '../../clients'
import { ColossusEventContext } from '../../typings/Colossus'
import { getPath, PAGE_TYPES, slugify, STORE_LOCATOR } from './utils'

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
  query: {
    map,
  },
  type: PAGE_TYPES[type],
})

const saveCategoriesInternal = async (
  identifiedCategories: IdentifiedCategory[],
  clients: Clients
) => {
  const { rewriterGraphql, apps } = clients
  const internals = await Promise.all(
    identifiedCategories.map(async identifiedCategory => {
      const { type, params, id, map } = identifiedCategory
      const path = await getPath(PAGE_TYPES[type], params, apps)
      return getInternal(path, type, id, map)
    })
  )

  await rewriterGraphql.saveManyInternals(internals)
}

const saveCategoryTree = async (
  category: Category,
  clients: Clients
): Promise<IdentifiedCategory[]> => {
  const { catalogGraphQL } = clients
  const { parentCategoryId, name } = category
  if (!parentCategoryId) {
    const identifiedCategory = {
      id: category.id,
      map: 'c',
      params: {
        department: slugify(name!),
      },
      type: 'DEPARTMENT' as CategoryTypes,
    }
    return [identifiedCategory]
  }

  const parentCategory = await catalogGraphQL
    .category(parentCategoryId)
    .then(res => res!.category)
  const identifiedCategories = await saveCategoryTree(parentCategory, clients)
  const { type, params, map } = identifiedCategories[0]
  if (type === 'DEPARTMENT') {
    const identifiedCategory = {
      id: category.id,
      map: `${map},c`,
      params: {
        ...params,
        category: slugify(name!),
      },
      type: 'CATEGORY' as CategoryTypes,
    }
    return [identifiedCategory, ...identifiedCategories]
  } else if (type === 'CATEGORY') {
    const identifiedCategory = {
      id: category.id,
      map: `${map},c`,
      params: {
        ...params,
        subcategory: slugify(name!),
      },
      type: 'SUBCATEGORY' as CategoryTypes,
    }
    return [identifiedCategory, ...identifiedCategories]
  } else {
    const identifiedCategory = {
      id: category.id,
      map: `${map},c`,
      params: {
        ...params,
        terms: params.terms
          ? `${params.terms}${slugify(name!)}`
          : slugify(name!),
      },
      type,
    }
    return [identifiedCategory, ...identifiedCategories]
  }
}

export async function saveInternalCategoryRoute(
  ctx: ColossusEventContext,
  next: () => Promise<any>
) {
  const {
    clients,
    vtex: { logger },
  } = ctx
  try {
    const category: Category = ctx.body
    const identifiedCategories = await saveCategoryTree(category, clients)
    await saveCategoriesInternal(identifiedCategories, clients)
  } catch (error) {
    logger.error(error)
  }

  await next()
}
