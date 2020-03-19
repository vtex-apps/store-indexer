import { TooManyRequestsError } from '@vtex/api'

import { ColossusEventContext } from '../typings/Colossus'

const MAX_REQUEST = 50
let COUNTER = 0

export async function throttle(
  _: ColossusEventContext,
  next: () => Promise<void>
) {
  COUNTER++
  try {
    if (COUNTER > MAX_REQUEST) {
      throw new TooManyRequestsError()
    }
    await next()
  } finally {
    COUNTER--
  }
}
