import { APP } from '@vtex/api'

import { Context } from '../typings/global'

export interface Settings {
  numberOfIndexedSearches: number
  usesMultiLanguageSearch: boolean
  resolveBrandMapQueryAs: string
}

export const DEFAULT_SETTINGS: Settings = {
  numberOfIndexedSearches: 0,
  resolveBrandMapQueryAs: 'b',
  usesMultiLanguageSearch: false,
}

export async function settings(ctx: Context, next: () => Promise<void>) {
  const {
    clients: { apps },
  } = ctx

  const appSettings = await apps.getAppSettings(APP.ID)
  ctx.state.settings = { ...DEFAULT_SETTINGS, ...appSettings }

  await next()
}
