import {
  Cached,
  ClientsConfig,
  LRUCache,
  ParamsContext,
  Service,
} from '@vtex/api'

import { Clients } from './clients'
import { brandInternals } from './middlewares/internals/brand'
import { categoryInternals } from './middlewares/internals/category'
import { deleteOldRoutes } from './middlewares/internals/delete'
import { productInternals } from './middlewares/internals/product'
import { saveInternals } from './middlewares/internals/save'
import { createCanonicals } from './middlewares/search/createCanonicals'
import { getSearchStats } from './middlewares/search/getSearchStats'
import { indexCanonicals } from './middlewares/search/indexCanonicals'
import { settings } from './middlewares/settings'
import { tenant } from './middlewares/tenant'
import { throttle } from './middlewares/throttle'
import { State } from './typings/global'

const TIMEOUT_MS = 3000
const TRANSLATION_CONCURRENCY = 10
const TRANSLATION_RETRIES = 3
const CONCURRENCY = 10

const tenantCacheStorage = new LRUCache<string, Cached>({
  max: 3000,
})

const appsCacheStorage = new LRUCache<string, Cached>({
  max: 3000,
})

metrics.trackCache('tenant', tenantCacheStorage)
metrics.trackCache('apps', appsCacheStorage)

const clients: ClientsConfig<Clients> = {
  implementation: Clients,
  options: {
    apps: {
      memoryCache: appsCacheStorage,
    },
    default: {
      concurrency: CONCURRENCY,
      retries: 2,
      timeout: TIMEOUT_MS,
    },
    messages: {
      concurrency: TRANSLATION_CONCURRENCY,
      retries: TRANSLATION_RETRIES,
      timeout: TIMEOUT_MS,
    },
    tenant: {
      memoryCache: tenantCacheStorage,
      timeout: TIMEOUT_MS,
    },
  },
}

export default new Service<Clients, State, ParamsContext>({
  clients,
  events: {
    broadcasterBrand: [
      throttle,
      settings,
      tenant,
      brandInternals,
      saveInternals,
      deleteOldRoutes,
    ],
    broadcasterCategory: [
      throttle,
      settings,
      tenant,
      categoryInternals,
      saveInternals,
      deleteOldRoutes,
    ],
    broadcasterProduct: [
      throttle,
      settings,
      tenant,
      productInternals,
      saveInternals,
      deleteOldRoutes,
    ],
    searchUrlsCountIndex: [
      throttle,
      settings,
      getSearchStats,
      tenant,
      createCanonicals,
      indexCanonicals,
    ],
  },
})
