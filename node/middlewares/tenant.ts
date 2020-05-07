import { NotFoundError } from '@vtex/api'

import { Context } from '../typings/global'

const TEN_MINUTES_S = 10 * 60

export async function tenant(ctx: Context, next: () => Promise<void>) {
  const {
    clients: { tenant: tenantClient },
    vtex: { account, logger },
  } = ctx
  const tenantInfo = await tenantClient.info({
    forceMaxAge: TEN_MINUTES_S,
    nullIfNotFound: true,
  })
  if (!tenantInfo) {
    logger.error(`Account ${account} not in tenant system`)
    ctx.body = `Account ${account} not in tenant system`
    throw NotFoundError
  }
  const locale = tenantInfo.defaultLocale

  ctx.state.tenantInfo = tenantInfo
  ctx.vtex.locale = locale
  ctx.vtex.tenant = { locale }

  await next()
}
