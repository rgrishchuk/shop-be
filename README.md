# Serverless Framework AWS NodeJS

These are the API services for https://github.com/rgrishchuk/shop-react-redux-cloudfront

## Usage

Make sure serverless is installed. [See installation guide.](https://www.serverless.com/framework/docs/providers/openwhisk/guide/installation/)

### Deployment

In order to deploy the service, you need to run the following command in the service folder:

```
$ sls deploy
```

After running deploy, you should see output similar to:

```bash
Deploying aws-node-project to stage dev (us-east-1)

✔ Service deployed to stack product-service-dev (69s)

endpoints:
  GET - https://cjuy3nd54e.execute-api.eu-west-1.amazonaws.com/dev/products
  GET - https://cjuy3nd54e.execute-api.eu-west-1.amazonaws.com/dev/products/{productId}
functions:
  getProductsList: product-service-dev-getProductsList (3.3 kB)
  getProductsById: product-service-dev-getProductsById (3.3 kB)


```

### Tests

Run tests in console.

```
$ npm run test
```

Run tests with coverage.

```
$ npm run test:coverage
```
### API documentation

The documentation is in the swagger.yml file.
