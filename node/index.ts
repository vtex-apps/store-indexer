import {
  Cached,
  ClientsConfig,
  LRUCache,
  ParamsContext,
  Service,
} from '@vtex/api'

import { Clients } from './clients'
import { initialize } from './middlewares/initialize'
import { saveInternalBrandRoute } from './middlewares/internals/saveInternalBrandRoute'
import { saveInternalCategoryRoute } from './middlewares/internals/saveInternalCategoryRoute'
import { saveInternalProductRoute } from './middlewares/internals/saveInternalProductRoute'
import { createCanonicals } from './middlewares/search/createCanonicals'
import { getSearchStats } from './middlewares/search/getSearchStats'
import { indexCanonicals } from './middlewares/search/indexCanonicals'
import { settings } from './middlewares/settings'
import { tenant } from './middlewares/tenant'
import { throttle } from './middlewares/throttle'
import { State } from './typings/global'

const TIMEOUT_MS = 3000
const TRANSLATION_CONCURRENCY = 5
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
    messagesGraphQL: {
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
    broadcasterBrand: [throttle, initialize, tenant, saveInternalBrandRoute],
    broadcasterCategory: [
      throttle,
      initialize,
      tenant,
      saveInternalCategoryRoute,
    ],
    broadcasterProduct: [
      throttle,
      initialize,
      tenant,
      saveInternalProductRoute,
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
