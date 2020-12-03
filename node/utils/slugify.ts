/* eslint-disable no-useless-escape */

export const slugify = (str: string) =>
  str
    .toLowerCase()
    .normalize('NFD')
    .replace(/([\u0300-\u036f]|,)/g, '')
    .replace(/([\u0020\u00A0])/g, '-')
    .replace(/(\u00A0|[*+~.()'"!:@&\[\]`,/ %$#?{}|><=_^])/g, '-')
