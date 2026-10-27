import { Binding } from '@vtex/api'
import { Product } from 'vtex.catalog-graphql'

export const filterBindingsBySalesChannel = (
  bindings: Binding[],
  salesChannels: Product['salesChannel']
): Binding[] => {
  const salesChannelsSet = salesChannels?.reduce((acc, sc) => {
    if (sc?.id) {
      acc.add(sc.id)
    }
    return acc
  }, new Set<string>())

  return bindings.filter(binding => {
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

export const filterStoreBindings = (bindings: Binding[]): Binding[] =>
  bindings.filter(binding => binding.targetProduct === 'vtex-storefront')
