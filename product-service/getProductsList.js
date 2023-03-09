const AWS = require('aws-sdk');

const { PRODUCTS_TABLE_NAME, STOCKS_TABLE_NAME } = process.env;
const dynamoDB = new AWS.DynamoDB.DocumentClient();

const headers = {
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET',
};

exports.handler = async (event) => {
  console.log('Incoming request:', event);

  try {
    const result = await dynamoDB.scan({ TableName: PRODUCTS_TABLE_NAME }).promise();

    const products = result.Items.map(async (product) => {
      const stock = await dynamoDB
        .get({
          TableName: STOCKS_TABLE_NAME,
          Key: { product_id: product.id },
        })
        .promise();

      return {
        ...product,
        count: stock.Item ? stock.Item.count : 0,
      };
    });

    const productsWithStock = await Promise.all(products);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(productsWithStock),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
