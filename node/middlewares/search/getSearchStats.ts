import { ColossusEventContext } from '../../typings/Colossus'


export async function getSearchStats(ctx: ColossusEventContext, next: () => Promise<any>){
  const { clients: { searchGraphql }, state: { settings: { numberOfIndexedSearches }} } = ctx
  const searchUrls = await searchGraphql.getSearchURLsCount(numberOfIndexedSearches) as Array<{path: string}>
  ctx.state.searchURLs = searchUrls
  await next()
}