import { prop } from 'ramda'
import { Category } from 'vtex.catalog-graphql'
import { InternalInput } from 'vtex.rewriter'

import { CatalogGraphQL } from '../../clients/catalogGraphQL/index'
import { ColossusEventContext } from '../../typings/Colossus'
import {
  getPath,
  PAGE_TYPES,
  slugify,
  STORE_LOCATOR,
  tenMinutesFromNowMS,
} from './utils'

type CategoryTypes = 'DEPARTMENT' | 'CATEGORY' | 'SUBCATEGORY'

interface IndentifiedCategory {
  type: CategoryTypes
  map: string
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

const identifyCategory = async (
  category: Category,
  catalogGraphQL: CatalogGraphQL
): Promise<IndentifiedCategory> => {
  const { parentCategoryId, name } = category
  if (!parentCategoryId) {
    return {
      map: 'c',
      params: {
        department: slugify(name!),
      },
      type: 'DEPARTMENT',
    }
  }

  const parentCategory = await catalogGraphQL
    .category(parentCategoryId)
    .then(prop('category'))
  const { type, params, map } = await identifyCategory(
    parentCategory,
    catalogGraphQL
  )
  if (type === 'DEPARTMENT') {
    return {
      map: `${map},c`,
      params: {
        ...params,
        category: slugify(name!),
      },
      type: 'CATEGORY',
    }
  } else if (type === 'CATEGORY') {
    return {
      map: `${map},c`,
      params: {
        ...params,
        subcategory: slugify(name!),
      },
      type: 'SUBCATEGORY',
    }
  } else {
    return {
      map: `${map},c`,
      params: {
        ...params,
        terms: params.terms
          ? `${params.terms}${slugify(name!)}`
          : slugify(name!),
      },
      type,
    }
  }
}

export async function saveInternalCategoryRoute(
  ctx: ColossusEventContext,
  next: () => Promise<any>
) {
  const {
    clients: { apps, rewriterGraphql, catalogGraphQL },
    vtex: { logger, binding },
  } = ctx
  try {
    const category: Category = ctx.body
    const { type, params, map } = await identifyCategory(
      category,
      catalogGraphQL
    )
    const path = await getPath(PAGE_TYPES[type], params, apps)
    const internal: InternalInput = getInternal(path, type, category.id, map)

    if (binding && binding.id) {
      internal.bindings = [binding.id]
    }

    await rewriterGraphql.saveInternal(internal)
  } catch (error) {
    logger.error(error)
  }

  await next()
}
