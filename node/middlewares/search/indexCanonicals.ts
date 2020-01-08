import * as querystring from 'querystring'
import { includes, propEq, splitAt, splitEvery } from 'ramda'
import { Catalog, CatalogPageTypeResponse } from '../../clients/catalog'
import { ColossusEventContext } from '../../typings/Colossus'
import { InternalRoute } from '../../typings/rewriter'

const BUCKET_SIZE = 100
const DAYS_TO_EXPIRE = 7

export async function indexCanonicals(ctx: ColossusEventContext, next: () => Promise<any>){
  const { clients: { rewriterGraphql, catalog }, state: { searchURLs } } = ctx
  const buckets = splitEvery(BUCKET_SIZE, searchURLs)
  const endDate = new Date()
  endDate.setDate(endDate.getDate() + DAYS_TO_EXPIRE)
  for(const URLsBucket of buckets){
    const internals = await Promise.all(
      URLsBucket.map<Promise<InternalRoute>>(url =>
        toInternalURL(url.path, url.canonicalPath!, endDate.toUTCString(), catalog)
      )
    )
    await rewriterGraphql.saveManyInternals(internals)
  }
  await next()
}

const toInternalURL = async (uri: string, canonicalPath: string, endDate: string, catalog: Catalog) => {
  const [path, query] = uri.split('?')
  const parsedQuery = querystring.parse(query)
  const { pageType } = await getPageType(path, `?${query}`, catalog)

  return {
    declarer: 'vtex.store@2.x',
    endDate,
    from: canonicalPath,
    id: 'search',
    query: parsedQuery,
    resolveAs: path,
    type: pageType.toLowerCase(),
  }
}

// Sends multiple requests (max 3) to pageType API, one with each important
// segments (first three), because sometimes the API return wrongly `NotFound`,
// for example `:department/:brand/:category`
const getPageType = async (path: string, search: string, catalog: Catalog) => {
  const IMPORTANT_SEGMENTS = [3, 2, 1]
  const segments = path.split('/')
  const responses = await Promise.all(
    IMPORTANT_SEGMENTS.map((len) => {
      const splittedPath = splitAt(len + 1, segments)[0].join('/')
      return splittedPath && segments.length > len ?
        catalog.pageType(splittedPath + search)
        : {pageType: 'NotFound'} as CatalogPageTypeResponse
    })
  )
  const pageTypeResponse =
    responses.find(response => !propEq('pageType', 'NotFound')(response)) ||
    ({} as CatalogPageTypeResponse)
  return handleResponse(pageTypeResponse, path)
}

const handleResponse = (pageTypeResponse: CatalogPageTypeResponse | undefined, path: string) => {
  const SEARCH_TYPES = ['Search', 'FullText']
  // Search with one segment, fallback handles this case
  if (!pageTypeResponse || (includes(pageTypeResponse.pageType) && path.split('/').length === 2)) {
    return { pageType: 'NotFound', id: 'null' } as CatalogPageTypeResponse
  }
  const { pageType, id } = pageTypeResponse
  if (!includes(pageType, SEARCH_TYPES)) {
    return { pageType, id } as CatalogPageTypeResponse
  }
  // Search with more segments, should render a category page to keep current behaviour
  return { pageType: 'Category', id: 'search' } as CatalogPageTypeResponse
}