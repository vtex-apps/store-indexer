import { prop } from 'ramda'
import { Category } from 'vtex.catalog-graphql'
import { InternalInput } from 'vtex.rewriter'

import { Clients } from '../../clients'
import { ColossusEventContext } from '../../typings/Colossus'
import {
  getPath,
  PAGE_TYPES,
  slugify,
  STORE_LOCATOR,
  tenMinutesFromNowMS,
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
}

const getInternal = (
  path: string,
  type: CategoryTypes,
  id: string,
  map: string
): InternalInput => ({
  declarer: STORE_LOCATOR,
  endDate: tenMinutesFromNowMS(),
  from: path,
  id,
  query: {
    map,
  },
  type: PAGE_TYPES[type],
})

const saveCategoryInternal = async (
  identifiedCategory: IdentifiedCategory,
  clients: Clients
) => {
  const { rewriterGraphql, apps } = clients
  const { type, params, id, map } = identifiedCategory
  const path = await getPath(PAGE_TYPES[type], params, apps)
  const internal: InternalInput = getInternal(path, type, id, map)

  await rewriterGraphql.saveInternal(internal)
}

const saveCategoryTree = async (
  category: Category,
  clients: Clients
): Promise<IdentifiedCategory> => {
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
    await saveCategoryInternal(identifiedCategory, clients)
    return identifiedCategory
  }

  const parentCategory = await catalogGraphQL
    .category(parentCategoryId)
    .then(prop('category'))
  const { type, params, map } = await saveCategoryTree(parentCategory, clients)
  if (type === 'DEPARTMENT') {
    const identifiedCategory = {
      id: parentCategory.id,
      map: `${map},c`,
      params: {
        ...params,
        category: slugify(name!),
      },
      type: 'CATEGORY' as CategoryTypes,
    }
    await saveCategoryInternal(identifiedCategory, clients)
    return identifiedCategory
  } else if (type === 'CATEGORY') {
    const identifiedCategory = {
      id: parentCategory.id,
      map: `${map},c`,
      params: {
        ...params,
        subcategory: slugify(name!),
      },
      type: 'SUBCATEGORY' as CategoryTypes,
    }
    await saveCategoryInternal(identifiedCategory, clients)
    return identifiedCategory
  } else {
    const identifiedCategory = {
      id: parentCategory.id,
      map: `${map},c`,
      params: {
        ...params,
        terms: params.terms
          ? `${params.terms}${slugify(name!)}`
          : slugify(name!),
      },
      type,
    }
    await saveCategoryInternal(identifiedCategory, clients)
    return identifiedCategory
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
    await saveCategoryTree(category, clients)
  } catch (error) {
    logger.error(error)
  }

  await next()
}
