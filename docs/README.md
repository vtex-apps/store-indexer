# Store Indexer

The Store Indexer is a VTEX IO app designed to listen to IO broadcasters and index data based on catalog changes.

## Key features

### Messages

The app updates translations whenever translatable fields are modified.

### Routes

Store Indexer updates internal routes by saving the correct page type and canonical route ID, and flags deactivated products as "not found".

### Search URLs

Store Indexer indexes the canonical URLs of top searches.

### Brand Search as Full Text

Enhance **Intelligent Search** by resolving brand search queries as full text. This configuration enables search results to include products where the brand name appears in fields like the product title or description, rather than limiting results to a brand filter. For detailed instructions, refer to [Setting up brand search queries as full text](https://developers.vtex.com/docs/guides/setting-up-brand-search-queries-as-full-text).

## Testing & Developing

Since the Store Indexer is not part of the store's rendering pipeline, testing can be complex. This section outlines how to manually generate an event from the broadcasting system to facilitate testing.

> The example below focuses on testing the product pipeline. Extending it to test other pipelines follows a similar approach.

### Step 1: Retrieve the Event Body

Use **catalog-graphql** to fetch the body of the event. The following `curl` command retrieves the necessary data:

```sh
curl --location --request POST 'https://app.io.vtex.com/vtex.catalog-graphql/v1/{account}/{workspace}/_v/graphql' \
--header 'Authorization: {auth}' \
--header 'x-vtex-locale: {locale}' \
--header 'x-vtex-tenant: {locale}' \
--header 'Content-Type: application/json' \
--data-raw '{
	"query": "query GetProduct ($identifier: ProductUniqueIdentifier!) {  product (identifier: $identifier) {    id    brandId    categoryId    departmentId    name    linkId    refId    isVisible    description    shortDescription    releaseDate    keywords    title    isActive    taxCode    metaTagDescription    supplierId    showWithoutStock    score    salesChannel {      id    }  }}",
	"variables": {
		"identifier": {
    		"field": "id",
    		"value": {productId}
		}
	}
}'
```

### Step 2: Create an Event for Store Indexer

After retrieving the event body, copy the value of the `product` key from the response. Use this data to create an event for the **Store Indexer**. Here's an example `curl` command with a mocked product:

```sh
curl --location --request POST 'https://app.io.vtex.com/vtex.store-indexer/v0/{account}/{workspace}/_events' \
--header 'Authorization: {auth}' \
--header 'x-event-handler-id: broadcasterProduct' \
--header 'Content-Type: application/json' \
--data-raw '{
    "id": "2000185",
    "brandId": "2000010",
    "categoryId": "48",
    "departmentId": "25",
    "name": "Jumper Best Friend",
    "linkId": "jumper-best-friend",
    "refId": "",
    "isVisible": true,
    "description": "",
    "shortDescription": "",
    "releaseDate": "2019-11-19T00:00:00",
    "keywords": [
        "Hoodie",
        "Best",
        "Friend",
        "blouse",
        "t-shirt",
        "jumper"
    ],
    "title": "Jumper Best Friend",
    "isActive": true,
    "taxCode": "",
    "metaTagDescription": "",
    "supplierId": null,
    "showWithoutStock": true,
    "score": null,
    "salesChannel": [
        {
            "id": "1"
        }
    ]
}'
```
