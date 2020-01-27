export const query = `
query GetProduct ($identifier: ProductUniqueIdentifier!) {
  product (identifier: $identifier) {
    id
    brandId
    categoryId
    departmentId
    name
    linkId
    refId
    isVisible
    description
    shortDescription
    releaseDate
    keywords
    title
    isActive
    taxCode
    metaTagDescription
    supplierId
    showWithoutStock
    score
  }
}`
