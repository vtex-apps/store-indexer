import { ColossusEventContext } from '../typings/Colossus'
import { MessageSaveInput, SaveArgs } from '../typings/IOMessages'
import { contentFromString, contextFromString } from '../utils/IOMessage'



export async function saveIOMessage(ctx: ColossusEventContext, next:() => Promise<any>){
  const {
    clients: {segment, messagesGraphQL},
    state: {tStringsByGroupContext},
  } = ctx

  console.log('---tStringsByGroupContext',tStringsByGroupContext)

  const messages = tStringsByGroupContext.reduce(
    (acc,[groupContext, tStrings])=>{
      tStrings.forEach(
        (tString)=>{
          console.log('---tString:',tString)
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

  console.log('---MESSAGES',messages)

  const saved = await messagesGraphQL.saveV2({
    from: channel.cultureInfo,
    messages,
    to: channel.cultureInfo,
  })

  console.log('---SAVED?',saved)

  await next()

}


