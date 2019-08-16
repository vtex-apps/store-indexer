import crypto from 'crypto'
import { ColossusEvent, ColossusEventContext } from '../typings/Colossus'


export function parseEvent (ctx: ColossusEventContext): ColossusEvent {
  const senderName = ctx.sender.split('@')[0]

  if (senderName === 'vtex.broadcaster') {
    console.log(ctx.key)

  }
  return {} as ColossusEvent
}

export function hashMD5(text: string) {
  const hash = crypto.createHash('md5')
  return hash.update(text).digest('hex')
}

