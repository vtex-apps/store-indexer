import { IOClients } from '@vtex/api'

import { Catalog } from './catalog'
import { Messages } from './messages'
import { Rewriter } from './rewriter'
import { SearchGraphql } from './searchGraphql'

/* eslint-disable @typescript-eslint/explicit-member-accessibility */
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

  get messages() {
    return this.getOrSet('messages', Messages)
  }
}
