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

export type GroupContext = 'Product' | 'Sku' | 'Brand' | 'Category' | 'Specifications-names' | 'Specifications-values'

export type TstringsByGroupContext = Array<[GroupContext,string[]]>

