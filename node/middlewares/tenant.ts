import { ColossusEventContext } from '../typings/Colossus'

export async function tenant(
  ctx: ColossusEventContext,
  next: () => Promise<any>
) {
  const {
    body: { locale, binding, tenant: tenantData },
  } = ctx
  ctx.vtex.locale = locale
  ctx.vtex.tenant = tenantData
  ctx.vtex.binding = binding
  await next()
}
