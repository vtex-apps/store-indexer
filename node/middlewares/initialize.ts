import { Resources } from '../resources'
import { Context } from '../typings/global'

export async function initialize(ctx: Context, next: () => Promise<void>) {
  ctx.state.resources = new Resources(ctx)

  await next()
}
