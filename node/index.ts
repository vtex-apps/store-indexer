import { ClientsConfig, Service } from '@vtex/api'

import { Clients } from './clients'
import { saveInternalProductRoute } from './events/saveInternalRoute'
import { saveIOMessage } from './events/saveIOMessage'
import {
  unwrapBrandTranslatables,
  unwrapCategoryTranslatables,
  unwrapProductTranslatables,
  unwrapSkuTranslatables,
} from './events/unwrap'
import { createCanonicals } from './middlewares/search/createCanonicals'
import { getSearchStats } from './middlewares/search/getSearchStats'
import { indexCanonicals } from './middlewares/search/indexCanonicals'
import { settings } from './middlewares/settings'
import { tenant } from './middlewares/tenant'
import { State } from './typings/Colossus'

const TIMEOUT_MS = 3000
const TRANSLATION_CONCURRENCY = 5
const TRANSLATION_RETRIES = 3

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
  },
}

export default new Service<Clients, State>({
  clients,
  events: {
    broadcasterBrand: [unwrapBrandTranslatables, saveIOMessage],
    broadcasterCategory: [unwrapCategoryTranslatables, saveIOMessage],
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
