import { EventContext, IOClients } from '@vtex/api'
import { Clients } from '../clients'
import { Brand, Category, Product, SKU } from './Catalog'



export interface ColossusEventContext extends EventContext<IOClients,State> {
  key: string
  sender: string
  body: any
  clients: Clients
  state: State
}

export interface State {
  SKU?: SKU
  Product?: Product
  Category?: Category
  Brand?: Brand
}


//////////////////////////////////////
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
