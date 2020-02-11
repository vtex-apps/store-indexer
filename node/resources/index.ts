import { ColossusEventContext } from '../typings/Colossus'
import { IdUrlIndex } from './idUrlIndex'

export class Resources {
  public idUrlIndex: IdUrlIndex

  constructor(ctx: ColossusEventContext) {
    const { vbase, rewriterGraphql } = ctx.clients
    this.idUrlIndex = new IdUrlIndex(vbase, rewriterGraphql)
  }
}
