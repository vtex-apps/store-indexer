import { MessageSaveInputV2 } from '@vtex/api'

import { ColossusEventContext } from '../typings/Colossus'
import { contentFromString, contextFromString } from '../utils/IOMessage'

export async function saveIOMessage(
  ctx: ColossusEventContext,
  next: () => Promise<any>
) {
  const {
    clients: { segment, messagesGraphQL },
    state: { tStringsByGroupContext },
  } = ctx
  const channel = await segment.getSegment()

  if (tStringsByGroupContext) {
    const messages = tStringsByGroupContext.reduce(
      (acc, [groupContext, tStrings]) => {
        tStrings.forEach(tString => {
          const content = contentFromString(tString)
          const context = contextFromString(tString)
          acc.push({
            context,
            groupContext,
            srcLang: channel.cultureInfo,
            srcMessage: content,
            targetMessage: content,
          })
        })
        return acc
      },
      [] as MessageSaveInputV2[]
    )

    await messagesGraphQL.saveV2({
      messages,
      to: channel.cultureInfo,
    })
  }

  await next()
}


