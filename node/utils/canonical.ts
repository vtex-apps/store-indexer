import * as querystring from 'querystring'
import { includes, propEq, splitAt } from 'ramda'
import { Catalog, CatalogPageTypeResponse } from '../clients/catalog'

export const toInternalURL = async (uri: string, canonicalPath: string, endDate: string, catalog: Catalog) => {
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
