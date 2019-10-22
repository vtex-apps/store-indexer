import { ClientsConfig, IOClients, Service } from '@vtex/api'

import { saveIOMessage } from './events/saveIOMessage'
import { unwrapBrandTranslatables, unwrapCategoryTranslatables, unwrapProductTranslatables, unwrapSkuTranslatables } from './events/unwrap'
import { State } from './typings/Colossus'

const TIMEOUT_MS = 3000
const TRANSLATION_CONCURRENCY = 5
const TRANSLATION_RETRIES = 3

const clients: ClientsConfig<IOClients> = {
  implementation: IOClients,
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

export default new Service<IOClients, State>({
  clients,
  events: {
    broadcasterBrand: [unwrapBrandTranslatables, saveIOMessage],
    broadcasterCategory: [unwrapCategoryTranslatables, saveIOMessage],
    broadcasterProduct: [unwrapProductTranslatables, saveIOMessage],
    broadcasterSku: [unwrapSkuTranslatables, saveIOMessage],
  },
})
