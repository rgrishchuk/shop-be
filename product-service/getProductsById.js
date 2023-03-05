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
    const result = await dynamoDB.get({
      TableName: PRODUCTS_TABLE_NAME,
      Key: { id: event.pathParameters.productId },
    }).promise();

    if (!result.Item) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Product not found' }),
      };
    }

    const stock = await dynamoDB.get({
      TableName: STOCKS_TABLE_NAME,
      Key: { product_id: event.pathParameters.productId },
    }).promise();

    const book = { ...result.Item, count: stock.Item ? stock.Item.count : 0 };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(book),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
