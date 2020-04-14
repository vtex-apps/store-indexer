/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import { IOClients } from '@vtex/api'

import { Catalog } from './catalog'
import { GraphQLServer } from './graphqlServer'
import { Rewriter } from './rewriter'
import { SearchGraphql } from './searchGraphql'

export class Clients extends IOClients {
  get searchGraphql() {
    return this.getOrSet('searchGraphql', SearchGraphql)
  }

  get catalog() {
    return this.getOrSet('catalog', Catalog)
  }

  get rewriter() {
    return this.getOrSet('rewriter', Rewriter)
  }

  get graphqlServer() {
    return this.getOrSet('graphqlServer', GraphQLServer)
  }
}
