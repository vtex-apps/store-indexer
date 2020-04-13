import { MessagesGraphQL } from '@vtex/api'

interface Message {
  from: string
  to: string
  content: string
  context: string
}

export const createTranslator = (messages: MessagesGraphQL) => async ({
  from,
  to,
  content,
  context,
}: Message) => {
  if (from.toLowerCase() === to.toLowerCase()) {
    return content
  }
  const translations = await messages.translate({
    indexedByFrom: [
      {
        from,
        messages: [{ content, context }],
      },
    ],
    to,
  })
  return translations[0]
}
