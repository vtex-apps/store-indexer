import { AppGraphQLClient, InstanceOptions, IOContext } from '@vtex/api'
import {
  EntityLocator,
  Internal,
  InternalInput,
  RedirectInput,
  RouteLocator,
  RoutesByBinding,
} from 'vtex.rewriter'

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

const rewriterDeleteInternalMutation = `mutation Delete($path: String!, $locator: RouteLocator) {
  internal {
    delete(path: $path, locator: $locator) {
      id
    }
  }
}`

const rewriterRoutesById = `query Routes($locator: EntityLocator!) {
  internal {
    routes(locator: $locator) {
      route
      binding
    }
  }
}
`

export class Rewriter extends AppGraphQLClient {
  constructor(ctx: IOContext, opts?: InstanceOptions) {
    super('vtex.rewriter@1.x', ctx, opts)
  }

  public async saveManyInternals(internals: InternalInput[]) {
    const { tenant } = this.context
    this.graphql.mutate<boolean, { routes: InternalInput[] }>(
      {
        mutate: rewriterSaveManyInternalMutation,
        variables: { routes: internals },
      },
      {
        headers: {
          ...(this.options && this.options.headers),
          'Proxy-Authorization': this.context.authToken,
          'x-vtex-tenant': tenant,
        },
        metric: 'rewriter-save-many-internal',
      }
    )
  }

  public async saveInternal(internal: InternalInput) {
    const { tenant } = this.context
    return this.graphql.mutate<
      { internal: { type: string } },
      { route: InternalInput }
    >(
      {
        mutate: rewriterSaveInternalMutation,
        variables: { route: internal },
      },
      {
        headers: {
          ...(this.options && this.options.headers),
          'Proxy-Authorization': this.context.authToken,
          'x-vtex-tenant': tenant,
        },
        metric: 'rewriter-save-internal',
      }
    )
  }

  public async saveRedirect(redirect: RedirectInput) {
    const { tenant } = this.context
    this.graphql.mutate<boolean, { route: RedirectInput }>(
      {
        mutate: rewriterSaveRedirectMutation,
        variables: { route: redirect },
      },
      {
        headers: {
          ...(this.options && this.options.headers),
          'Proxy-Authorization': this.context.authToken,
          'x-vtex-tenant': tenant,
        },
        metric: 'rewriter-save-redirect',
      }
    )
  }

  public async getInternal(path: string) {
    const { tenant } = this.context
    return this.graphql
      .query<{ internal: { get: Internal } }, { path: string }>(
        {
          query: rewriterGetInternal,
          variables: { path },
        },
        {
          headers: {
            ...(this.options && this.options.headers),
            'Proxy-Authorization': this.context.authToken,
            'x-vtex-tenant': tenant,
          },
          metric: 'rewriter-get-internal',
        }
      )
      .then(res => res.data?.internal.get)
  }

  public routesById(locator: EntityLocator): Promise<RoutesByBinding[]> {
    return this.graphql
      .query<
        { internal: { routes: RoutesByBinding[] } },
        { locator: EntityLocator }
      >(
        {
          query: rewriterRoutesById,
          variables: { locator },
        },
        {
          metric: 'rewriter-get-routes-by-id',
        }
      )
      .then(res => res.data?.internal?.routes) as Promise<RoutesByBinding[]>
  }

  public async deleteInternal(locator: RouteLocator) {
    return this.graphql.mutate<
      { internal: { id: string } },
      { path: string; locator: RouteLocator }
    >(
      {
        mutate: rewriterDeleteInternalMutation,
        variables: { path: locator.from, locator },
      },
      {
        metric: 'rewriter-delete-internal',
      }
    )
  }
}
