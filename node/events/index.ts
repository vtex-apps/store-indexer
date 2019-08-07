// import * as compose from 'koa-compose'
import compose from 'koa-compose'
import { brandIOMessageSave, categoryIOMessageSave, productIOMessageSave, skuIOMessageSave } from './generateIOMessage'
import { unwrapBrand, unwrapCategory, unwrapProduct, unwrapSKU } from './unwrap'

export const myEventHandlerSKU = compose([unwrapSKU])
export const myEventHandlerProduct = compose([unwrapSKU])
export const myEventHandlerBrand = compose([unwrapSKU])
export const myEventHandlerCategory = compose([unwrapSKU])
