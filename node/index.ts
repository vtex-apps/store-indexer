import { Cached, ClientsConfig, LRUCache, Service } from '@vtex/api'

import { Clients } from './clients'
import { saveIOMessage } from './events/saveIOMessage'
import {
  unwrapBrandTranslatables,
  unwrapCategoryTranslatables,
  unwrapProductTranslatables,
  unwrapSkuTranslatables,
} from './events/unwrap'
import { saveInternalBrandRoute } from './middlewares/internals/saveInternalBrandRoute'
import { saveInternalCategoryRoute } from './middlewares/internals/saveInternalCategoryRoute'
import { saveInternalProductRoute } from './middlewares/internals/saveInternalProductRoute'
import { createCanonicals } from './middlewares/search/createCanonicals'
import { getSearchStats } from './middlewares/search/getSearchStats'
import { indexCanonicals } from './middlewares/search/indexCanonicals'
import { settings } from './middlewares/settings'
import { tenant } from './middlewares/tenant'
import { State } from './typings/Colossus'

const TIMEOUT_MS = 1000
const CONCURRENCY = 5

const TRANSLATION_TIMEOUT_MS = 3000
const TRANSLATION_CONCURRENCY = 5
const TRANSLATION_RETRIES = 3

const tenantCacheStorage = new LRUCache<string, Cached>({
  max: 3000,
})

const appsCacheStorage = new LRUCache<string, Cached>({
  max: 3000,
})

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
      timeout: TRANSLATION_TIMEOUT_MS,
    },
    tenant: {
      memoryCache: tenantCacheStorage,
    },
  },
}

export default new Service<Clients, State>({
  clients,
  events: {
    broadcasterBrand: [
      tenant,
      saveInternalBrandRoute,
      unwrapBrandTranslatables,
      saveIOMessage,
    ],
    broadcasterCategory: [
      tenant,
      saveInternalCategoryRoute,
      unwrapCategoryTranslatables,
      saveIOMessage,
    ],
    broadcasterProduct: [
      tenant,
      saveInternalProductRoute,
      unwrapProductTranslatables,
      saveIOMessage,
    ],
    broadcasterSku: [unwrapSkuTranslatables, saveIOMessage],
    searchUrlsCountIndex: [
      settings,
      getSearchStats,
      tenant,
      createCanonicals,
      indexCanonicals,
    ],
  },
})
