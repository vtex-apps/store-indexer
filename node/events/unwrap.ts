import { ColossusContext } from '../typings/Colossus'
import { Specification } from './../typings/Catalog'
import { toSkuProvider } from '../utils/IOMessage';


export const unwrapSKU = async (ctx: ColossusContext, next:() => Promise<any>) => {
  console.log('unwrapSKU!!!!')
  console.log('ctx',ctx)
  // const bla = {
  //     id: 'ajshdbajs',
  //     name: 'ajshdbajs',
  //     nameComplete: 'ajshdbajs',
  //     productSpecifications: [{fieldName: 'ajshbajs', fieldValues:['jshdaj']}],
  //     skuSpecifications: [{fieldName: 'ajshbajs', fieldValues:['jshdaj']}],

  // }
  // const bla = {
  //     id: ctx.body.Id,
  //     name: ctx.body.SkuName,
  //     nameComplete: ctx.body.NameComplete,
  //     productSpecifications: unwrapSpecifications(ctx.body.ProductSpecifications),
  //     skuSpecifications: unwrapSpecifications(ctx.body.SkuSpecifications),

  // }
  // ctx.state = {
  //   SKU:bla,
  // }
  // console.log('ctx.state', ctx.state)
  // console.log('ctx.body', ctx.body)
  // console.log('ctx.clients', ctx.clients)
  // const existsSkuProvider = await ctx.clients.vbase.getJSON('translations',`${toSkuProvider(ctx.state.SKU.id)}.json`)
  // console.log({existsSkuProvider})
next()
}

const unwrapSpecifications =   (specifications: any) => {
  const specificationsEntity = new Array() as [Specification]
  (specifications || []).forEach(
    (specification: any) =>{
      const specificationFormated: Specification = {
        fieldName: specification.FieldName,
        fieldValues: specification.FieldValues,
      }
      specificationsEntity.push(specificationFormated)
    }
  )
  return specificationsEntity
}

export const unwrapProduct = async (ctx: ColossusContext): Promise<any> => {
  console.log('unwrapProduct!!!!')
  ctx.state = {
    Product:{description: ctx.body.Description,
      descriptionShort: ctx.body.DescriptionShort,
      keywords: ctx.body.Keywords,
      metaTagDescription: ctx.body.MetaTagDescription,
      productId: ctx.body.Id,
      productName: ctx.body.Name,
      titleTag: ctx.body.Title,},
  }
}

export const unwrapCategory = async (ctx: ColossusContext): Promise<any> => {
  console.log('unwrapCategory!!!!')
  ctx.state = {
    Category:{id: ctx.body.id,
      metaTagDescription: ctx.body.MetaTagDescription,
      name: ctx.body.name,
      titleTag: ctx.body.Title,},
  }
}

export const unwrapBrand = async (ctx: ColossusContext): Promise<any> => {
  console.log('unwrapBrand!!!!!')
  ctx.state = {
    Brand:{
      id: ctx.body.id,
      metaTagDescription: ctx.body.metaTagDescription,
      name: ctx.body.name,
      title: ctx.body.title,
    },
  }
}

// id: number
//   name: string
//   titleTag: string
//   metaTagDescription: string


