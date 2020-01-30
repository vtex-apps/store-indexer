import { AppGraphQLClient, InstanceOptions, IOContext } from '@vtex/api'
import { Brand, Category, Product, Sku } from 'vtex.catalog-graphql'

import { query as getBrand } from './brand'
import { query as getCategory } from './category'
import { query as getProduct } from './product'
import { query as getSKU } from './sku'

export class CatalogGraphQL extends AppGraphQLClient {
  public constructor(ctx: IOContext, opts?: InstanceOptions) {
    super('vtex.catalog-graphql', ctx, {
      ...opts,
      headers: {
        ...(opts && opts.headers),
        cookie: `VtexIdclientAutCookie=${ctx.authToken}`,
      },
    })
  }

  public sku = (id: string) => {
    const variables = {
      identifier: {
        field: 'id',
        value: id,
      },
    }
    return this.graphql
      .query<{ sku: Sku }, typeof variables>(
        {
          inflight: true,
          query: getSKU,
          variables,
        },
        {
          forceMaxAge: 5,
        }
      )
      .then(res => res.data!)
  }

  public product = (id: string) => {
    const variables = {
      identifier: {
        field: 'id',
        value: id,
      },
    }
    return this.graphql
      .query<{ product: Product }, typeof variables>(
        {
          inflight: true,
          query: getProduct,
          variables,
        },
        {
          forceMaxAge: 5,
        }
      )
      .then(res => res.data!)
  }

  public category = (id: string) =>
    this.graphql
      .query<{ category: Category }, { id: string }>(
        {
          inflight: true,
          query: getCategory,
          variables: { id },
        },
        {
          forceMaxAge: 5,
        }
      )
      .then(res => res.data!)

  public brand = (id: string) =>
    this.graphql
      .query<{ brand: Brand }, { id: string }>(
        {
          inflight: true,
          query: getBrand,
          variables: { id },
        },
        {
          forceMaxAge: 5,
        }
      )
      .then(res => res.data!)
}
