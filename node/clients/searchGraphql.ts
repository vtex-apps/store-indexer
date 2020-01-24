import { AppGraphQLClient, InstanceOptions, IOContext } from '@vtex/api'

const searchUrlsCountQuery = `query SearchURLsCount($limit: Int){
  searchURLsCount(limit: $limit){
    path
  }
}`

export class SearchGraphql extends AppGraphQLClient {
  constructor(ctx: IOContext, opts?: InstanceOptions) {
    super('vtex.search-graphql', ctx, opts)
  }

  public async getSearchURLsCount(limit: number) {
    return this.graphql
      .query<any, any>(
        {
          query: searchUrlsCountQuery,
          variables: {
            limit,
          },
        },
        {
          metric: 'search-urls-count',
        }
      )
      .then(({ data: { searchURLsCount } }) => {
        return searchURLsCount
      })
  }
}
