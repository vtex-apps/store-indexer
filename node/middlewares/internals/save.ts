import { LINKED } from '@vtex/api'

import { Context } from '../../typings/global'

export async function saveInternals(ctx: Context, next: () => Promise<void>) {
  const {
    vtex: { logger },
    clients: { rewriter },
    state: { internals },
  } = ctx
  try {
    if (internals) {
      if (LINKED) {
        // eslint-disable-next-line no-console
        console.log('Saving', internals)
      }
      await rewriter.saveManyInternals(internals)
    }
  } catch (error) {
    logger.error(error)
  }

  await next()
}
