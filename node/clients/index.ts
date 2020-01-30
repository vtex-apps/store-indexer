import { IOClients } from '@vtex/api'

import { Catalog } from './catalog'
import { CatalogGraphQL } from './catalogGraphQL'
import { RewriterGraphql } from './rewriterGraphql'
import { SearchGraphql } from './searchGraphql'

export class Clients extends IOClients {
  get searchGraphql() {
    return this.getOrSet('searchGraphql', SearchGraphql)
  }

  get catalog() {
    return this.getOrSet('catalog', Catalog)
  }

  get rewriterGraphql() {
    return this.getOrSet('rewriterGraphql', RewriterGraphql)
  }

  public get catalogGraphQL() {
    return this.getOrSet('catalogGraphQL', CatalogGraphQL)
  }
}
