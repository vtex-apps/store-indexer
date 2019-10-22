import { EventContext, IOClients } from '@vtex/api'

export interface ColossusEventContext extends EventContext<IOClients,State> {
  key: string
  sender: string
  body: any
  clients: IOClients
  state: State
}

export interface State {
  tStringsByGroupContext: Array<[string, string[]]>
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
