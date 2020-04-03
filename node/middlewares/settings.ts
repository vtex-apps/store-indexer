import { Context } from '../typings/global'

export interface Settings {
  numberOfIndexedSearches: number
}

export const APP_ID = process.env.VTEX_APP_ID!

export const DEFAULT_SETTINGS: Settings = {
  numberOfIndexedSearches: 0,
}

export async function settings(ctx: Context, next: () => Promise<void>) {
  const {
    clients: { apps },
  } = ctx

  const appSettings = await apps.getAppSettings(APP_ID)
  ctx.state.settings = { ...DEFAULT_SETTINGS, ...appSettings }

  await next()
}
