import { EventContext } from '@vtex/api'
import { Clients } from '../clients'

export interface ColossusEventContext extends EventContext<Clients, State> {
  key: string
  sender: string
  body: any
  clients: Clients
  state: State
}

export interface State {
  tStringsByGroupContext: Array<[string, string[]]>
  searchURLs: Array<{path: string, canonicalPath?: string}>
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
