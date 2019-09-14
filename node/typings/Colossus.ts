import { EventContext, IOClients } from '@vtex/api'
import { Clients } from '../clients'
import { TstringsByGroupContext } from './IOMessages'



export interface ColossusEventContext extends EventContext<IOClients,State> {
  key: string
  sender: string
  body: any
  clients: Clients
  state: State
}


export interface State {
  tStringsByGroupContext: TstringsByGroupContext
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
