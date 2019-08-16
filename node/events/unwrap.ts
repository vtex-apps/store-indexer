import { ColossusEventContext } from '../typings/Colossus'
import { Specification } from './../typings/Catalog'

export async function doNothing(ctx: ColossusEventContext, next: () => Promise<any>){
  await next ()
}

export async function unwrapSKU(ctx: ColossusEventContext, next:() => Promise<any>){
  ctx.state = {
    SKU: {
      id: ctx.body.Id,
      name: ctx.body.SkuName,
      nameComplete: ctx.body.NameComplete,
      productSpecifications: unwrapSpecifications(ctx.body.ProductSpecifications),
      skuSpecifications: unwrapSpecifications(ctx.body.SkuSpecifications),},
  }
  await next()
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

export async function unwrapProduct(ctx: ColossusEventContext, next:() => Promise<any>){
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
  await next()
}

export async function unwrapCategory(ctx: ColossusEventContext, next:() => Promise<any>){
  console.log('unwrapCategory!!!!')
  ctx.state = {
    Category:{id: ctx.body.id,
      metaTagDescription: ctx.body.MetaTagDescription,
      name: ctx.body.name,
      titleTag: ctx.body.Title,
    },
  }
  await next()
}

export async function unwrapBrand(ctx: ColossusEventContext, next:() => Promise<any>){
  console.log('unwrapBrand!!!!!')
  ctx.state = {
    Brand:{
      id: ctx.body.id,
      metaTagDescription: ctx.body.metaTagDescription,
      name: ctx.body.name,
      title: ctx.body.title,
    },
  }
  await next()
}
