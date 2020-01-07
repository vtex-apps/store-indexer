import * as querystring from 'querystring'
import { splitEvery } from 'ramda'
import { ColossusEventContext } from '../../typings/Colossus'
import { InternalRoute } from '../../typings/rewriter'

const BUCKET_SIZE = 100
const DAYS_TO_EXPIRE = 7

export async function indexCanonicals(ctx: ColossusEventContext, next: () => Promise<any>){
  const { clients: { rewriterGraphql }, state: { searchURLs } } = ctx
  const buckets = splitEvery(BUCKET_SIZE, searchURLs)
  const endDate = new Date()
  endDate.setDate(endDate.getDate() + DAYS_TO_EXPIRE)
  for(const URLsBucket of buckets){
    const internals = URLsBucket.map<InternalRoute>(url => toInternalURL(url.path, url.canonicalPath!, endDate.toUTCString()))
    await rewriterGraphql.saveManyInternals(internals)
  }
  await next()
}

const toInternalURL = (uri: string, canonicalPath: string, endDate: string) => {
  const [, query] = uri.split('?')
  return {
    declarer: 'vtex.store@2.x',
    endDate,
    from: canonicalPath,
    id: canonicalPath,
    query: querystring.parse(query),
    type: 'search',
  }
}