/* eslint-disable no-console */
import { LINKED } from '@vtex/api'

import { Context } from '../../typings/global'

export async function deleteOldRoutes(ctx: Context, next: () => Promise<void>) {
  const {
    clients: { rewriter },
    state: { oldRoutes },
  } = ctx
  if (oldRoutes) {
    if (LINKED) {
      console.log(
        JSON.stringify({
          message: 'Old Routes deletion',
          oldRoutes,
        })
      )
    }
    await rewriter.deleteManyInternals(oldRoutes)
  }

  await next()
}
