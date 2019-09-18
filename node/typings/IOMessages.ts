export interface SaveArgs {
  to: string
  messages: MessageSaveInput[]
  from?: string
}

export interface MessageSaveInput {
  srcMessage: string
  context?: string
  targetMessage: string
  groupContext?: string
}

export type TstringsByGroupContext = Array<[string,string[]]>

