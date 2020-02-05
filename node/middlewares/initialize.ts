import { Resources } from '../resources'
import { ColossusEventContext } from '../typings/Colossus'

export async function initialize(
  ctx: ColossusEventContext,
  next: () => Promise<any>
) {
  ctx.resources = new Resources(ctx)

  await next()
}
