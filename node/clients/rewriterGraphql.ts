import { AppGraphQLClient, InstanceOptions, IOContext } from '@vtex/api'
import { Internal, InternalInput, RedirectInput } from 'vtex.rewriter'

const rewriterSaveManyInternalMutation = `mutation SaveMany($routes: [InternalInput!]!) {
  internal {
    saveMany(routes: $routes)
  }
}`

const rewriterSaveInternalMutation = `mutation Save($route: InternalInput!) {
  internal {
    save(route: $route) {
      type
    }
  }
}`

const rewriterSaveRedirectMutation = `mutation Save($route: RedirectInput!) {
  redirect {
    save(route: $route) {
      type
    }
  }
}`

const rewriterGetInternal = `query Internal($path: String!) {
  internal {
    get(path: $path) {
      id
    }
  }
}`

export class RewriterGraphql extends AppGraphQLClient {
  constructor(ctx: IOContext, opts?: InstanceOptions) {
    super('vtex.rewriter@1.x', ctx, opts)
  }

  public async saveManyInternals(internals: InternalInput[]) {
    const { tenant, locale } = this.context
    this.graphql.mutate<boolean, { routes: InternalInput[] }>(
      {
        mutate: rewriterSaveManyInternalMutation,
        variables: { routes: internals },
      },
      {
        headers: {
          ...(this.options && this.options.headers),
          'Proxy-Authorization': this.context.authToken,
          'x-vtex-locale': locale,
          'x-vtex-tenant': tenant,
        },
        metric: 'rewriter-save-many-internal',
      }
    )
  }

  public async saveInternal(internal: InternalInput) {
    const { tenant, locale } = this.context
    this.graphql.mutate<boolean, { route: InternalInput }>(
      {
        mutate: rewriterSaveInternalMutation,
        variables: { route: internal },
      },
      {
        headers: {
          ...(this.options && this.options.headers),
          'Proxy-Authorization': this.context.authToken,
          'x-vtex-locale': locale,
          'x-vtex-tenant': tenant,
        },
        metric: 'rewriter-save-internal',
      }
    )
  }

  public async saveRedirect(redirect: RedirectInput) {
    const { tenant, locale } = this.context
    this.graphql.mutate<boolean, { route: RedirectInput }>(
      {
        mutate: rewriterSaveRedirectMutation,
        variables: { route: redirect },
      },
      {
        headers: {
          ...(this.options && this.options.headers),
          'Proxy-Authorization': this.context.authToken,
          'x-vtex-locale': locale,
          'x-vtex-tenant': tenant,
        },
        metric: 'rewriter-save-redirect',
      }
    )
  }

  public async getInternal(path: string) {
    const { tenant, locale } = this.context
    return this.graphql
      .query<Internal, { path: string }>(
        {
          query: rewriterGetInternal,
          variables: { path },
        },
        {
          headers: {
            ...(this.options && this.options.headers),
            'Proxy-Authorization': this.context.authToken,
            'x-vtex-locale': locale,
            'x-vtex-tenant': tenant,
          },
          metric: 'rewriter-get-internal',
        }
      )
      .then(res => res.data)
  }
}
