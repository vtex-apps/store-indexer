import { AppClient, InstanceOptions, IOContext, RequestConfig } from '@vtex/api'

export type PageType =
  | 'Category'
  | 'Department'
  | 'Product'
  | 'FullText'
  | 'SubCategory'
  | 'Brand'
  | 'Search'
  | 'NotFound'

export interface CatalogPageTypeResponse {
  pageType: PageType
  id: string
  url: string
}

export interface FieldResponseAPI {
  Name: string
  CategoryId: number | null
  FieldId: number
  IsActive: boolean
  IsRequired: boolean
  FieldTypeId: number
  FieldTypeName: string
  FieldValueId: string | null
  Description: string | null
  IsStockKeepingUnit: boolean
  IsFilter: boolean
  IsOnProductDetails: boolean
  Position: number
  IsWizard: boolean
  IsTopMenuLinkActive: boolean
  IsSideMenuLinkActive: boolean
  DefaultValue: string | null
  FieldGroupId: number
  FieldGroupName: string
}

export class Catalog extends AppClient {
  constructor(ctx: IOContext, opts?: InstanceOptions) {
    super('vtex.catalog-api-proxy@0.x', ctx, opts)
  }

  public pageType = (path: string, query?: Record<string, string>) =>
    this.get<CatalogPageTypeResponse>(`/pub/portal/pagetype${path}`, {
      headers: {
        ...(this.options && this.options.headers),
        'Proxy-Authorization': this.context.authToken,
        'x-vtex-locale': this.context.locale,
        'x-vtex-tenant': this.context.tenant,
      },
      metric: 'catalog-pagetype',
      params: query,
    })

  public getField = (id: number) =>
    this.get<FieldResponseAPI>(`/pub/specification/fieldGet/${id}`, {
      headers: {
        ...(this.options && this.options.headers),
        'Proxy-Authorization': this.context.authToken,
        'x-vtex-locale': this.context.locale,
        'x-vtex-tenant': this.context.tenant,
      },
      metric: 'catalog-get-field-by-id',
    })

  private get = <T = any>(url: string, config: RequestConfig = {}) =>
    this.http.get<T>(`/proxy/catalog${url}`, config)
}
