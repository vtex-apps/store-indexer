import { zip } from 'ramda'
import { Catalog } from '../../clients/catalog'
import { ColossusEventContext } from '../../typings/Colossus'

export async function createCanonicals(ctx: ColossusEventContext, next: () => Promise<any>){
  const { clients: { catalogGraphql }, state: { searchURLs } } = ctx
  
  for(const searchURL of searchURLs) {
    const { path } = searchURL
    const [segments, queryMap] = path.split('?map=')
    const pathSegments = segments.slice(1).split('/')
    const mapSegments = queryMap.split(',')
    const zippedSegments = zip(pathSegments, mapSegments)
    const enrichedPathSegments: string[] = []

    for (const [segment, mapValue] of zippedSegments) {
       enrichedPathSegments.push(await enrichSegmentName(catalogGraphql, segment, mapValue))
    }

    searchURL.canonicalPath = `/${enrichedPathSegments.join('/')}`.toLowerCase().replace(/\s/g, '-')
    console.log('searchURL', JSON.stringify(searchURL, null, 2))
  }

  await next()
}

const enrichSegmentName = async (catalog: Catalog, segment: string, mapValue: string) => {
  const [fieldName, fieldValue] = mapValue.split('_')
  if(fieldName === 'specificationFilter' && !isNaN(Number(fieldValue))) {
    const { Name: specificationFilterName } = await catalog.getField(Number(fieldValue))
    return `${specificationFilterName}-${segment}`
  }
    
  return segment
}