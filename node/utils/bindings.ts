import { Tenant } from '@vtex/api'
import { Product } from 'vtex.catalog-graphql'

export const filterBindingsBySalesChannel = (
  tenantInfo: Tenant,
  salesChannels: Product['salesChannel']
): Tenant['bindings'] => {
  const salesChannelsSet = salesChannels?.reduce((acc, sc) => {
    if (sc?.id) {
      acc.add(sc.id)
    }
    return acc
  }, new Set<string>())

  return tenantInfo.bindings.filter(binding => {
    if (binding.targetProduct === 'vtex-storefront') {
      const bindingSC: number | undefined =
        binding.extraContext.portal?.salesChannel
      const productActiveInBindingSC =
        bindingSC && salesChannelsSet?.has(bindingSC.toString())
      if (productActiveInBindingSC || !salesChannelsSet) {
        return true
      }
    }
    return false
  })
}

export const filterStoreBindings = (tenantInfo: Tenant): Tenant['bindings'] =>
  tenantInfo.bindings.filter(
    binding => binding.targetProduct === 'vtex-storefront'
  )
