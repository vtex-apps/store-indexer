import { Context } from '../typings/global'

const TEN_MINUTES_S = 10 * 60

export async function tenant(ctx: Context, next: () => Promise<void>) {
  const {
    clients: { tenant: tenantClient },
  } = ctx
  const tenantInfo = await tenantClient.info({
    forceMaxAge: TEN_MINUTES_S,
    nullIfNotFound: true,
  })
  const locale = tenantInfo.defaultLocale

  ctx.state.tenantInfo = tenantInfo
  ctx.vtex.locale = locale
  ctx.vtex.tenant = { locale }

  await next()
}
