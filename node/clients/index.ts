import { IOClients } from '@vtex/api'
import { Catalog } from './catalog'
import { RewriterGraphql } from './rewriterGraphql'
import { SearchGraphql } from './searchGraphql'

export class Clients extends IOClients {
  get searchGraphql() {
    return this.getOrSet('searchGraphql', SearchGraphql)
  }

  get catalogGraphql() {
    return this.getOrSet('catalog', Catalog)
  }

  get rewriterGraphql() {
    return this.getOrSet('rewriterGraphql', RewriterGraphql)
  }
}
