import * as querystring from 'querystring'

import { includes, propEq, splitAt, splitEvery } from 'ramda'
import { InternalInput } from 'vtex.rewriter'

import { Catalog, CatalogPageTypeResponse } from '../../clients/catalog'
import { ColossusEventContext } from '../../typings/Colossus'
import { INDEXED_ORIGIN, PAGE_TYPE_TO_STORE_ENTITIES, STORE_LOCATOR } from '../internals/utils'

const BUCKET_SIZE = 100
const DAYS_TO_EXPIRE = 7

const handleResponse = (
  pageTypeResponse: CatalogPageTypeResponse | undefined,
  path: string
) => {
  const SEARCH_TYPES = ['Search', 'FullText']
  // Search with one segment, fallback handles this case
  if (
    !pageTypeResponse ||
    (includes(pageTypeResponse.pageType) && path.split('/').length === 2)
  ) {
    return { pageType: 'NotFound', id: 'null' } as CatalogPageTypeResponse
  }
  const { pageType, id } = pageTypeResponse
  if (!includes(pageType, SEARCH_TYPES)) {
    return { pageType, id } as CatalogPageTypeResponse
  }
  // Search with more segments, should render a category page to keep current behaviour
  return { pageType: 'Category', id: 'search' } as CatalogPageTypeResponse
}

// Sends multiple requests (max 3) to pageType API, one with each important
// segments (first three), because sometimes the API return wrongly `NotFound`,
// for example `:department/:brand/:category`
const getPageType = async (path: string, search: string, catalog: Catalog) => {
  const IMPORTANT_SEGMENTS = [3, 2, 1]
  const segments = path.split('/')
  const responses = await Promise.all(
    IMPORTANT_SEGMENTS.map(len => {
      const splittedPath = splitAt(len + 1, segments)[0].join('/')
      return splittedPath && segments.length > len
        ? catalog.pageType(splittedPath + search)
        : ({ pageType: 'NotFound' } as CatalogPageTypeResponse)
    })
  )
  const pageTypeResponse =
    responses.find(response => !propEq('pageType', 'NotFound')(response)) ||
    ({} as CatalogPageTypeResponse)
  return handleResponse(pageTypeResponse, path)
}

const toInternalURL = async (
  uri: string,
  canonicalPath: string,
  endDate: string,
  catalog: Catalog
): Promise<InternalInput | null> => {
  const [path, query] = uri.split('?')
  const parsedQuery = querystring.parse(query)
  const { pageType } = await getPageType(path, `?${query}`, catalog)
  const type = PAGE_TYPE_TO_STORE_ENTITIES[pageType]

  if(!type){
    return null
  }

  return {
    declarer: STORE_LOCATOR,
    endDate,
    from: canonicalPath,
    id: 'search',
    origin: INDEXED_ORIGIN,
    query: parsedQuery,
    resolveAs: path,
    type,
  }
}

export async function indexCanonicals(
  ctx: ColossusEventContext,
  next: () => Promise<any>
) {
  const {
    clients: { rewriterGraphql, catalog },
    state: { searchURLs },
  } = ctx
  const buckets = splitEvery(BUCKET_SIZE, searchURLs)
  const endDate = new Date()
  endDate.setDate(endDate.getDate() + DAYS_TO_EXPIRE)
  for (const URLsBucket of buckets) {
    const internals = await Promise.all(
      URLsBucket.map<Promise<InternalInput| null>>(url =>
        toInternalURL(
          url.path,
          url.canonicalPath!,
          endDate.toUTCString(),
          catalog
        )
      )
    )
    await rewriterGraphql.saveManyInternals(
      internals.filter(internal => internal !== null) as InternalInput[]
    )
  }
  await next()
}
