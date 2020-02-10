import { TooManyRequestsError } from '@vtex/api'


const MAX_REQUEST = 100
let COUNTER = 0

export async function filter(_: any, next: () => Promise<any>) {
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
