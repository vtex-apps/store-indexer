import { Messages } from '../clients/messages'

interface Message {
  content: string
  context: string
}

export const createTranslator = (service: Messages) => async (
  from: string,
  to: string,
  messages: Message[]
) => {
  if (from.toLowerCase() === to.toLowerCase()) {
    return messages.map(({ content }) => content)
  }
  const translations = await service.translateNoCache({
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
