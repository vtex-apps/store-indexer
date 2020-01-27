export const query = `
query GetBrand($id: ID!) {
  brand (id: $id) {
    id
    name
    text
    keywords
    siteTitle
    active
    menuHome
    adWordsRemarketingCode
    lomadeeCampaignCode
    score
  }
}
`
