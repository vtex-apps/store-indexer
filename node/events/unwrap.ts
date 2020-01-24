import { filter, pick } from 'ramda'

import { ColossusEventContext } from '../typings/Colossus'

const skuTranslatableFields = ['name']
const productTranslatableFields = [
  'name',
  'description',
  'shortDescription',
  'title',
  'metaTagDescription',
]

const categoryTranslatableFields = ['name', 'title', 'description']
const brandTranslatableFields = ['name', 'text', 'siteTitle']

export async function unwrapTranslatables(
  ctx: ColossusEventContext,
  next: () => Promise<any>,
  translatableFields: string[],
  groupCtxPrefix: string
) {
  const tStrings = filter(
    (field: string) => field !== null,
    Object.values(pick(translatableFields, ctx.body.data))) as string[]
  const id = ctx.body.id
  if (tStrings.length) {
    ctx.state.tStringsByGroupContext = [[`${groupCtxPrefix}.${id}`, tStrings]]
  }

  await next()
}

export async function unwrapSkuTranslatables(
  ctx: ColossusEventContext,
  next: () => Promise<any>
) {
  unwrapTranslatables(ctx, next, skuTranslatableFields, 'Sku-Id')
}

export async function unwrapProductTranslatables(
  ctx: ColossusEventContext,
  next: () => Promise<any>
) {
  unwrapTranslatables(ctx, next, productTranslatableFields, 'Product-Id')
}

export async function unwrapCategoryTranslatables(
  ctx: ColossusEventContext,
  next: () => Promise<any>
) {
  unwrapTranslatables(ctx, next, categoryTranslatableFields, 'Category-Id')
}

export async function unwrapBrandTranslatables(
  ctx: ColossusEventContext,
  next: () => Promise<any>
) {
  unwrapTranslatables(ctx, next, brandTranslatableFields, 'Brand-Id')
}
