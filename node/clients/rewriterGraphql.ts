import { AppGraphQLClient, InstanceOptions, IOContext } from '@vtex/api'
import { InternalRoute } from '../typings/rewriter'

const rewiterSaveInternalMutation = `mutation SaveMany($routes: [InternalInput!]!) {
  internal {
    saveMany(routes: $routes)
  }
}`


export class RewriterGraphql extends AppGraphQLClient {
  constructor(ctx: IOContext, opts?: InstanceOptions) {
    super('vtex.rewriter', ctx, opts)
  }

  public async saveManyInternals(internals: InternalRoute[]){
    const { tenant, locale } = this.context
    this.graphql.mutate<boolean, { routes: InternalRoute[] }>({
      mutate: rewiterSaveInternalMutation,
      variables: { routes: internals },
    },
    {
      headers: {
        ...(this.options && this.options.headers),
        'Proxy-Authorization': this.context.authToken,
        'x-vtex-locale': locale,
        'x-vtex-tenant': tenant,
      },
      metric: 'rewriter-save-internal-searches',
    })
  }
}