import { pick, pluck, uniq } from 'ramda'
import { ColossusEventContext } from '../typings/Colossus'

export async function unwrapSkuTranslatables(ctx: ColossusEventContext, next: () => Promise<any>){
  console.log('---body', ctx.body)

  const tStringsSku = Object.values(pick(['SkuName', 'NameComplete'], ctx.body)) as string[]
  const tStringsSpecificationsNames = pluck('FieldName', uniq((ctx.body.ProductSpecifications || [])
    .concat(ctx.body.SkuSpecifications || []))) as string[]
  const tStringsSpecificationsValues = (pluck('FieldValues', uniq((ctx.body.ProductSpecifications || [])
    .concat(ctx.body.SkuSpecifications || []))) as string[])
    .reduce(
      (acc, values) => {
        return acc.concat(values)
      },
      [] as string[]
    )

  ctx.state.tStringsByGroupContext = []
  if (tStringsSku.length){
    ctx.state.tStringsByGroupContext.push([`Sku-Id.${ctx.body.Id}`, tStringsSku])
  }
  if (tStringsSpecificationsNames.length){
    ctx.state.tStringsByGroupContext.push(['Specifications-names', tStringsSpecificationsNames])
  }
  if (tStringsSpecificationsValues.length){
    ctx.state.tStringsByGroupContext.push(['Specifications-values', tStringsSpecificationsValues])
  }

  await next()
}

export async function unwrapProductTranslatables(ctx: ColossusEventContext, next: () => Promise<any>){
  console.log('---body', ctx.body)
  const tStringsProduct = Object.values(pick(['Name', 'Description', 'DescriptionShort', 'Title', 'MetaTagDescription'], ctx.body)) as string[]
  const id = ctx.body.id
  if (tStringsProduct){
    ctx.state.tStringsByGroupContext = [[`Product-Id.${id}`, tStringsProduct]]
  }

  await next()
}

export async function unwrapBrandTranslatables(ctx: ColossusEventContext, next: () => Promise<any>){
  console.log('---body', ctx.body)

  const tStringsBrand = Object.values(pick(['name', 'Title', 'MetaTagDescription'], ctx.body)) as string[]
  const id = ctx.body.id
  if (tStringsBrand){
    ctx.state.tStringsByGroupContext = [[`Brand-Id.${id}`, tStringsBrand]]
  }

  await next()
}

export async function unwrapCategoryTranslatables(ctx: ColossusEventContext, next:() => Promise<any>){
  console.log('---body', ctx.body)
  const tStringsCategory = Object.values(pick(['GlobalCategoryName', 'name', 'Title', 'MetaTagDescription'], ctx.body)) as string[]
  const id = ctx.body.id
  if (tStringsCategory){
    ctx.state.tStringsByGroupContext = [[`Category-Id.${id}`, tStringsCategory]]
  }

  await next()
}

