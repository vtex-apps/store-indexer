import { MessagesGraphQL } from '@vtex/api'

interface Message {
  content: string
  context: string
}

export const createTranslator = (service: MessagesGraphQL) => async (
  from: string,
  to: string,
  messages: Message[]
) => {
  if (from.toLowerCase() === to.toLowerCase()) {
    return messages.map(({ content }) => content)
  }
  const translations = await service.translate({
    indexedByFrom: [
      {
        from,
        messages,
      },
    ],
    to,
  })
  return translations
}
