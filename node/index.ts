import { ClientsConfig, LRUCache, Service } from '@vtex/api'
import { Clients } from './clients'
import { brandIOMessageSave, categoryIOMessageSave, productIOMessageSave, skuIOMessageSave } from './events/generateIOMessage'
import { unwrapBrand, unwrapCategory, unwrapProduct, unwrapSKU } from './events/unwrap'

const TIMEOUT_MS = 3000
const TRANSLATION_CONCURRENCY = 5
const TRANSLATION_RETRIES = 3

const memoryCache = new LRUCache<string, any>({max: 5000})
metrics.trackCache('status', memoryCache)

const clients: ClientsConfig<Clients> = {
  implementation: Clients,
  options: {
    default: {
      retries: 2,
      timeout: TIMEOUT_MS,
    },
    messagesGraphQL: {
      concurrency: TRANSLATION_CONCURRENCY,
      retries: TRANSLATION_RETRIES,
      timeout: TIMEOUT_MS,
    },
    status: {
      memoryCache,
    },
  },
}


interface State {
  code: number
}

export default new Service<Clients, State>({
  clients,
  events: {
    broadcasterBrand: [unwrapBrand, brandIOMessageSave],
    broadcasterCategory: [unwrapCategory, categoryIOMessageSave],
    broadcasterProduct: [unwrapProduct, productIOMessageSave],
    // broadcasterBrand: doNothing,
    // broadcasterCategory: doNothing,
    // broadcasterProduct: doNothing,
    broadcasterSku: [unwrapSKU,skuIOMessageSave],
  },
})
