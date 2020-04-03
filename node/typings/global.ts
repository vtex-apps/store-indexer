import { EventContext, RecorderState, Tenant } from '@vtex/api'

import { Clients } from '../clients'
import { Settings } from '../middlewares/settings'
import { Resources } from '../resources'

export type Context = EventContext<Clients, State>

export interface State extends RecorderState {
  resources: Resources
  tStringsByGroupContext: Array<[string, string[]]>
  searchURLs: Array<{ path: string; canonicalPath?: string }>
  settings: Settings
  tenantInfo?: Tenant
}

export interface Event {
  appId: string
  key: string
  message: string
  sender: string
  senderName: string
  trigger: string
  buildId: string
  buildCode: string
  routeId: string
}
