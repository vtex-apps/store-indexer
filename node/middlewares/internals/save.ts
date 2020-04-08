import { LINKED } from '@vtex/api'

import { Context } from '../../typings/global'

export async function saveInternals(ctx: Context, next: () => Promise<void>) {
  const {
    clients: { rewriter },
    state: { internals },
  } = ctx
  if (internals) {
    if (LINKED) {
      // eslint-disable-next-line no-console
      console.log('Saving', internals)
    }
    await rewriter.saveManyInternals(internals)
  }

  await next()
}
