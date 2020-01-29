import { ColossusEventContext } from '../typings/Colossus'
import { IdUrlIndex } from './idUrlIndex'

export class Resources {
  public idUrlIndex: IdUrlIndex

  constructor(ctx: ColossusEventContext) {
    this.idUrlIndex = new IdUrlIndex(ctx.clients.vbase)
  }
}
