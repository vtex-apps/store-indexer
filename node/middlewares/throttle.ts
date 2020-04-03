import { TooManyRequestsError } from '@vtex/api'

import { Context } from '../typings/global'

const MAX_REQUEST = 10
let COUNTER = 0

export async function throttle(_: Context, next: () => Promise<void>) {
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
