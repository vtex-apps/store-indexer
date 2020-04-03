import { Context } from '../typings/global'
import { IdUrlIndex } from './idUrlIndex'

export class Resources {
  public idUrlIndex: IdUrlIndex

  constructor(ctx: Context) {
    const { vbase, rewriterGraphql } = ctx.clients
    this.idUrlIndex = new IdUrlIndex(vbase, rewriterGraphql)
  }
}
