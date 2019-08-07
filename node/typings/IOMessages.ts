export interface SaveArgs {
  to: string
  messagesByProvider: MessageSaveByProviderInput[]
}

export interface MessageSaveByProviderInput {
  provider: string
  messages: MessageSaveInput[]
}

export interface MessageSaveInput {
  id: string
  content: string
  description?: string
}
