import { forEach } from 'ramda'
import { ColossusEventContext } from '../typings/Colossus'
import { MessageSaveInput, SaveArgs } from '../typings/IOMessages'
import { hashMD5 } from '../utils'
import { toCategoryProvider, toProductProvider, toSkuProvider } from '../utils/IOMessage'
import { Specification } from './../typings/Catalog'
import { MessageSaveByProviderInput } from './../typings/IOMessages'

export async function skuIOMessageSave(ctx: ColossusEventContext): Promise<void> {
  console.log('skuIOMessageSave!!!')
  const segment = await ctx.clients.segment.getSegment()
  const allMessagesByProvider = new Array() as [MessageSaveByProviderInput]
  const allSkuMessages = new Array() as [MessageSaveInput]
    allSkuMessages.push(
      {
        content: ctx.state.SKU!.name,
        id: 'name',
      }
    )
    allSkuMessages.push(
      {
        content: ctx.state.SKU!.nameComplete,
        id: 'nameComplete',
      }
    )
    allMessagesByProvider.push(
      {
        messages: allSkuMessages,
        provider: toSkuProvider(ctx.state.SKU!.id),
      }
    )
    forEach(
      (specification: Specification) => {
        allMessagesByProvider.push(
          {
            messages: [{
              content: specification.fieldName,
              id: 'fieldName',
            }],
            provider: hashMD5(specification.fieldName),
          }
        )
        forEach(
          (value: string)=>{
            allMessagesByProvider.push(
              {
                messages: [{
                  content: value,
                  id: 'fieldValue',
                }],
                provider: hashMD5(value),
              }
            )
          },
          specification.fieldValues
        )
      },
      ctx.state!.SKU!.productSpecifications.concat(ctx.state!.SKU!.skuSpecifications)
    )
    const skuIOMessage: SaveArgs ={
      messagesByProvider: allMessagesByProvider,
      to: segment.cultureInfo,
    }


    await ctx.clients.messagesGraphQL.save(skuIOMessage)
}

export async function productIOMessageSave(ctx: ColossusEventContext): Promise<void> {
  console.log('productIOMessageSave!!!')
  const segment = await ctx.clients.segment.getSegment()
  const allMessages = new Array() as [MessageSaveInput]
    allMessages.push(
      {
        content: ctx.state!.Product!.description,
        id: 'description',
      }
    )
    allMessages.push(
      {
        content: ctx.state!.Product!.descriptionShort,
        id: 'descriptionShort',
      }
    )
    allMessages.push(
      {
        content: ctx.state!.Product!.metaTagDescription,
        id: 'metaTagDescription',
      }
    )
    allMessages.push(
      {
        content: ctx.state!.Product!.productName,
        id: 'productName',
      }
    )
    allMessages.push(
      {
        content: ctx.state!.Product!.titleTag,
        id: 'titleTag',
      }
    )
    forEach(
      (keyword: string) => {
        allMessages.push(
          {
            content: keyword,
            id: keyword,
          }
        )
      },
      ctx.state!.Product!.keywords
    )
    const productIOMessage: SaveArgs ={
      messagesByProvider: [
        {
          messages: allMessages,
          provider: toProductProvider(ctx.state!.Product!.productId),
        },
      ],
      to: segment.cultureInfo,
    }

    await ctx.clients.messagesGraphQL.save(productIOMessage)
}

export  async function brandIOMessageSave (ctx: ColossusEventContext): Promise<void> {
  console.log('brandIOMessageSave!!!')
  const segment = await ctx.clients.segment.getSegment()
  const allMessages = new Array() as [MessageSaveInput]
  allMessages.push(
    {
      content: ctx.state!.Brand!.metaTagDescription,
      id: 'metaTagDescription',
    }
  )
  allMessages.push(
    {
      content: ctx.state!.Brand!.name,
      id: 'name',
    }
  )
  allMessages.push(
    {
      content: ctx.state!.Brand!.title,
      id: 'titleTag',
    }
  )
  const categoryIOMessage: SaveArgs ={
    messagesByProvider: [
      {
        messages: allMessages,
        provider: toCategoryProvider(ctx.state!.Category!.id),
      },
    ],
    to: segment.cultureInfo,
  }
  await ctx.clients.messagesGraphQL.save(categoryIOMessage)
}

export  async function categoryIOMessageSave (ctx: ColossusEventContext): Promise<void> {
  console.log('categoryIOMessageSave!!!')
  const segment = await ctx.clients.segment.getSegment()
  const allMessages = new Array() as [MessageSaveInput]
    allMessages.push(
      {
        content: ctx.state!.Category!.metaTagDescription,
        id: 'metaTagDescription',
      }
    )
    allMessages.push(
      {
        content: ctx.state!.Category!.name,
        id: 'name',
      }
    )
    allMessages.push(
      {
        content: ctx.state!.Category!.titleTag,
        id: 'titleTag',
      }
    )
    const categoryIOMessage: SaveArgs ={
      messagesByProvider: [
        {
          messages: allMessages,
          provider: toCategoryProvider(ctx.state!.Category!.id),
        },
      ],
      to: segment.cultureInfo,
    }

    await ctx.clients.messagesGraphQL.save(categoryIOMessage)
}

