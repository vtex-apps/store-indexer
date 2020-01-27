import { Clients } from '../clients'
import { ColossusEventContext } from '../typings/Colossus'

const TEN_MINUTES_S = 10 * 60

const getTenant = async (
  clients: Clients
): Promise<{ tenantInfo: any; locale: string }> => {
  const { segment, tenant: tenantClient } = clients
  const [segmentData, tenantInfo] = await Promise.all([
    segment.getSegmentByToken(null),
    tenantClient
      .info({
        forceMaxAge: TEN_MINUTES_S,
        nullIfNotFound: true,
      })
      .catch((_: any) => undefined),
  ])
  const cultureFromTenant = tenantInfo && tenantInfo.defaultLocale
  const cultureFromDefaultSegment = segmentData!.cultureInfo
  const locale = cultureFromTenant || cultureFromDefaultSegment

  return {
    locale,
    tenantInfo: tenantInfo || { locale },
  }
}

export async function tenant(
  ctx: ColossusEventContext,
  next: () => Promise<any>
) {
  if (!ctx.vtex.tenant || !ctx.vtex.locale) {
    const { locale, tenantInfo } = await getTenant(ctx.clients)

    ctx.vtex.locale = locale
    ctx.vtex.tenant = tenantInfo
  }
  await next()
}
