import { Context } from '../../typings/global'

export async function getSearchStats(ctx: Context, next: () => Promise<void>) {
  const {
    clients: { searchGraphql },
    state: {
      settings: { numberOfIndexedSearches },
    },
  } = ctx
  const searchUrls = (await searchGraphql.getSearchURLsCount(
    numberOfIndexedSearches
  )) as Array<{ path: string }>
  ctx.state.searchURLs = searchUrls
  await next()
}
