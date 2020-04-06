# Store Indexer

An VTEXIO app that listens to IO's broadcasters and indexes data according to catalog changes.

#### Messages

It updates translations when translatable fields changes

#### Routes

It updates internal routes. Saves correct page type and id of the canonical routes, and it also saves 
deactivated products as not found.

### Search URLs

Indexes the canoncial of the top searches 

### Testing & Developing
Since store-indexer is not in the store's rendering pipeline, testing it can be a bit obscure. 
This section teaches you how to handcraft an event from the broadcasting system so we can test it easily

I have documented here only how to test the product pipeline, but extending it to test the other pipelines should be simple

First of all, we need to retrieve the body of the event. For this, we will use the catalog-graphql. This curl should do the job
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

Now, copy the value of the key `product` of the returned value. With this value we can create our event for store-indexer.
The curl bellow is an example of this event for a product with a mocked product
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
