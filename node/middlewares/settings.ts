import { ColossusEventContext } from '../typings/Colossus'

export interface Settings {
  numberOfIndexedSearches: number
}

export const APP_ID = process.env.VTEX_APP_ID!

export const DEFAULT_SETTINGS: Settings = {
  numberOfIndexedSearches: 500,
}

export async function settings(ctx: ColossusEventContext, next: () => Promise<any>) {
  const {
    clients: { apps },
  } = ctx

  const appSettings = await apps.getAppSettings(APP_ID)
  ctx.state.settings = { ...DEFAULT_SETTINGS, ...appSettings }

  await next()
}