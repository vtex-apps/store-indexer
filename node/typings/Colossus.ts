import { EventContext, RecorderState, Tenant } from '@vtex/api'

import { Clients } from '../clients'
import { Settings } from '../middlewares/settings'
import { Resources } from '../resources'

export interface ColossusEventContext extends EventContext<Clients, State> {
  key: string
  sender: string
  body: any
  clients: Clients
  state: State
}

export interface State extends RecorderState {
  resources: Resources
  tStringsByGroupContext: Array<[string, string[]]>
  searchURLs: Array<{ path: string; canonicalPath?: string }>
  settings: Settings
  tenantInfo?: Tenant
}

export interface ColossusEvent {
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
