import { splitEvery } from 'ramda'
import { ColossusEventContext } from '../typings/Colossus'
import { InternalRoute } from '../typings/rewriter'
import { toInternalURL } from '../utils/canonical'

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
