import { ColossusEventContext } from '../typings/Colossus'
import { MessageSaveInput } from '../typings/IOMessages'
import { contentFromString, contextFromString } from '../utils/IOMessage'



export async function saveIOMessage(ctx: ColossusEventContext, next:() => Promise<any>){
  const {
    clients: {segment, messagesGraphQL},
    state: {tStringsByGroupContext},
  } = ctx

  const messages = tStringsByGroupContext.reduce(
    (acc,[groupContext, tStrings])=>{
      tStrings.forEach(
        (tString)=>{
          const content = contentFromString(tString)
          const context = contextFromString(tString)
          acc.push({
            context,
            groupContext,
            srcMessage: content,
            targetMessage: content,
          })
        }
      )
      return acc
    },
    [] as MessageSaveInput[]
  )

  const channel = await segment.getSegment()

  await messagesGraphQL.saveV2({
    from: channel.cultureInfo,
    messages,
    to: channel.cultureInfo,
  })

  await next()

}


