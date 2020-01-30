export const query = `
query GetCategory($id: ID!) {
  category (id: $id) {
    id
    name
    title
    parentCategoryId
    description
    isActive
    globalCategoryId
    score
  }
}
`
