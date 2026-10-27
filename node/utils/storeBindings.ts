import {
  APIBindingRes,
  Binding,
  getCanonicalAndAlternateAddresses,
  inferTargetProduct,
  LRUCache,
} from '@vtex/api'

import { Context } from '../typings/global'

export interface StoreBindings {
  bindings: Binding[]
  locale: string
  /* True when the License Manager has no site for the account (404). */
  inactive?: boolean
}

const ONE_HOUR_S = 60 * 60
const BINDINGS_TTL_MS = ONE_HOUR_S * 1000
const INACTIVE_TTL_MS = 30 * 60 * 1000
const NOT_FOUND = 404

const cache = new LRUCache<string, StoreBindings>({ max: 3000 })

/* Tenant API exposed the default sales channel as extraContext.portal.salesChannel, which the bindings filters rely on. */
const toBinding = (lm: APIBindingRes, fallbackLocale: string): Binding => {
  const {
    canonicalBaseAddress,
    alternateBaseAddresses,
  } = getCanonicalAndAlternateAddresses(lm)

  return {
    alternateBaseAddresses,
    canonicalBaseAddress,
    defaultCurrency: '',
    defaultLocale: lm.DefaultLocale || fallbackLocale,
    extraContext:
      lm.DefaultSalesChannelId != null
        ? { portal: { salesChannel: lm.DefaultSalesChannelId } }
        : {},
    id: lm.Id,
    supportedCurrencies: [],
    supportedLocales: lm.SupportedLocales ?? [],
    targetProduct: inferTargetProduct(
      canonicalBaseAddress,
      alternateBaseAddresses
    ),
  }
}

const deriveLocale = (lmBindings: APIBindingRes[]) => {
  const withLocale = lmBindings.filter(b => Boolean(b.DefaultLocale))
  const storefront = withLocale.find(b => {
    const { canonicalBaseAddress, alternateBaseAddresses } =
      getCanonicalAndAlternateAddresses(b)
    return (
      inferTargetProduct(canonicalBaseAddress, alternateBaseAddresses) ===
      'vtex-storefront'
    )
  })
  return (storefront ?? withLocale[0])?.DefaultLocale ?? ''
}

const isNotFound = (error: any) =>
  error?.response?.status === NOT_FOUND || error?.status === NOT_FOUND

/**
 * Replaces the deprecated Tenant API: bindings come from the License Manager and
 * the locale from the default segment. A 404 means the account has no site
 * (legacy CMS store) and is cached briefly; other failures propagate uncached.
 */
export const fetchStoreBindings = async (
  ctx: Context
): Promise<StoreBindings> => {
  const {
    clients: { licenseManager, segment },
    vtex: { account, workspace, logger },
  } = ctx
  const key = `${account}--${workspace}`

  const cached = cache.get(key)
  if (cached) {
    return cached
  }

  let lmBindings: APIBindingRes[]
  try {
    lmBindings = await licenseManager.listBindings(account, {
      forceMaxAge: ONE_HOUR_S,
    })
  } catch (error) {
    if (!isNotFound(error)) {
      throw error
    }

    const inactive: StoreBindings = { bindings: [], inactive: true, locale: '' }
    cache.set(key, inactive, INACTIVE_TTL_MS)
    logger.warn({
      message: 'Account has no License Manager bindings, skipping indexing',
    })
    return inactive
  }

  const segmentLocale = await segment
    .getSegmentByToken(null)
    .then(data => data.cultureInfo)
    .catch(() => null)
  const locale = segmentLocale || deriveLocale(lmBindings)

  const result: StoreBindings = {
    bindings: lmBindings.map(b => toBinding(b, locale)),
    locale,
  }

  /* Empty results (store still being configured) are never pinned. */
  if (result.bindings.length > 0) {
    cache.set(key, result, BINDINGS_TTL_MS)
  }

  return result
}
