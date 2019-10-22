import { pick } from 'ramda'
import { ColossusEventContext } from '../typings/Colossus'

const skuTranslatableFields = ['name']
const productTranslatableFields = ['Name', 'Description', 'DescriptionShort', 'Title', 'MetaTagDescription']
const categoryTranslatableFields = ['GlobalCategoryName', 'name', 'Title', 'MetaTagDescription']
const brandTranslatableFields = ['name', 'Title', 'MetaTagDescription']

export async function unwrapSkuTranslatables(ctx: ColossusEventContext, next: () => Promise<any>){
  unwrapTranslatables(ctx, next, skuTranslatableFields, 'Sku-Id')
}

export async function unwrapProductTranslatables(ctx: ColossusEventContext, next: () => Promise<any>){
  unwrapTranslatables(ctx, next, productTranslatableFields, 'Product-Id')
}

export async function unwrapCategoryTranslatables(ctx: ColossusEventContext, next: () => Promise<any>){
  unwrapTranslatables(ctx, next, categoryTranslatableFields, 'Category-Id')
}

export async function unwrapBrandTranslatables(ctx: ColossusEventContext, next: () => Promise<any>){
  unwrapTranslatables(ctx, next, brandTranslatableFields, 'Brand-Id')
}

export async function unwrapTranslatables(ctx: ColossusEventContext, next:() => Promise<any>, translatableFields: string[], groupCtxPrefix: string){
  console.log('---body', ctx.body)
  const tStrings = Object.values(pick(translatableFields, ctx.body)) as string[]
  const id = ctx.body.id
  if (tStrings.length){
    ctx.state.tStringsByGroupContext = [[`${groupCtxPrefix}.${id}`, tStrings]]
  }

  await next()
}

