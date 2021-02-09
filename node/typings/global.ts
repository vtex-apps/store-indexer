import { EventContext, RecorderState, Tenant } from '@vtex/api'
import { InternalInput, RouteLocator } from 'vtex.rewriter'

import { Clients } from '../clients'
import { Settings } from '../middlewares/settings'

export type Context = EventContext<Clients, State>

export interface State extends RecorderState {
  searchURLs: Array<{ path: string; canonicalPath?: string }>
  settings: Settings
  tenantInfo: Tenant
  internals?: InternalInput[]
  oldRoutes?: RouteLocator[]
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
