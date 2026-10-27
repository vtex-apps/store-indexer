import { Context } from '../typings/global'
import { fetchStoreBindings } from '../utils/storeBindings'

export async function tenant(ctx: Context, next: () => Promise<void>) {
  const { bindings, locale } = await fetchStoreBindings(ctx)

  /* No storefront binding means there are no routes to index. */
  if (!bindings.some(b => b.targetProduct === 'vtex-storefront')) {
    return
  }

  ctx.state.bindings = bindings
  ctx.state.tenantLocale = locale
  ctx.vtex.locale = locale
  ctx.vtex.tenant = { locale }

  await next()
}
