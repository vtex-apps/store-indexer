import { ColossusEventContext } from '../../typings/Colossus'

const MAX_URLS_INDEXING_SIZE = 1e6

export async function getSearchStats(ctx: ColossusEventContext, next: () => Promise<any>){
  const { clients: { searchGraphql } } = ctx
  const searchUrls = await searchGraphql.getSearchURLsCount(MAX_URLS_INDEXING_SIZE) as Array<{path: string}>
  ctx.state.searchURLs = searchUrls
  await next()
}