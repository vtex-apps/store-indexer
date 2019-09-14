import { pick, pluck } from 'ramda'
import { ColossusEventContext } from '../typings/Colossus'

export async function doNothing(ctx: ColossusEventContext, next: () => Promise<any>){
  await next ()
}

export async function unwrapSkuTranslatables(ctx: ColossusEventContext, next:() => Promise<any>){
  console.log('---unwrapSkuMessages!!!!','---body',ctx.body)

  const tStringsSku = Object.values(pick(['SkuName','NameComplete',],ctx.body)) as string[]
  const tStringsSpecificationsNames = pluck('FieldName',ctx.body.ProductSpecifications.concat(ctx.body.SkuSpecifications)) as string[]
  const tStringsSpecificationsValues = (pluck('FieldValues',ctx.body.ProductSpecifications.concat(ctx.body.SkuSpecifications)) as string[]).
    reduce(
      (acc, values)=>{
        console.log('---values',values)
        return acc.concat(values)},
      [] as string[]
    )

  ctx.state.tStringsByGroupContext = []
  if (tStringsSku){
    ctx.state.tStringsByGroupContext.push(['Sku',tStringsSku])
  }
  if (tStringsSpecificationsNames){
    ctx.state.tStringsByGroupContext.push(['Specifications-names',tStringsSpecificationsNames])
  }
  if (tStringsSpecificationsValues){
    ctx.state.tStringsByGroupContext.push(['Specifications-values',tStringsSpecificationsValues])
  }

  await next()
}

export async function unwrapProductTranslatables(ctx: ColossusEventContext, next:() => Promise<any>){
  console.log('---unwrapProductMessages!!!!','---body',ctx.body)
  const tStringsProduct = Object.values(pick(['Name','Description','DescriptionShort','Title','MetaTagDescription'],ctx.body)) as string[]
  if (tStringsProduct){
    ctx.state.tStringsByGroupContext = [['Product', tStringsProduct]]
  }

  await next()
}

export async function unwrapBrandTranslatables(ctx: ColossusEventContext, next:() => Promise<any>){
  console.log('---unwrapBrandMessages!!!!','---body',ctx.body)
  const tStringsBrand = Object.values(pick(['name','Title','MetaTagDescription'],ctx.body)) as string[]
  if (tStringsBrand){
    ctx.state.tStringsByGroupContext = [['Brand', tStringsBrand]]
  }

  await next()
}

export async function unwrapCategoryTranslatables(ctx: ColossusEventContext, next:() => Promise<any>){
  console.log('---unwrapCategoryMessages!!!!','---body',ctx.body)
  const tStringsCategory = Object.values(pick(['GlobalCategoryName','name','Title','MetaTagDescription'],ctx.body)) as string[]
  if (tStringsCategory){
    ctx.state.tStringsByGroupContext = [['Category', tStringsCategory]]
  }

  await next()
}

