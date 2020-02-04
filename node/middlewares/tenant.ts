import { Clients } from '../clients'
import { ColossusEventContext } from '../typings/Colossus'

const TEN_MINUTES_S = 10 * 60

const getHeaders = async (
  clients: Clients,
  tenantInfo: any
): Promise<{ tenantHeader: { locale: string }; locale: string }> => {
  const { segment } = clients
  const segmentData = await segment.getSegmentByToken(null)
  const cultureFromTenant = tenantInfo && tenantInfo.defaultLocale
  const cultureFromDefaultSegment = segmentData!.cultureInfo
  const locale = cultureFromTenant || cultureFromDefaultSegment

  return {
    locale,
    tenantHeader: { locale },
  }
}

const getTenant = (clients: Clients) =>
  clients.tenant
    .info({
      forceMaxAge: TEN_MINUTES_S,
      nullIfNotFound: true,
    })
    .catch((_: any) => undefined)

export async function tenant(
  ctx: ColossusEventContext,
  next: () => Promise<any>
) {
  const tenantInfo = await getTenant(ctx.clients)
  ctx.state.tenantInfo = tenantInfo
  if (!ctx.vtex.tenant || !ctx.vtex.locale) {
    const { locale, tenantHeader } = await getHeaders(ctx.clients, tenantInfo)
    ctx.vtex.locale = locale
    ctx.vtex.tenant = tenantHeader
  }
  await next()
}
