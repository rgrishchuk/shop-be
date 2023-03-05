const AWS = require('aws-sdk');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const { PRODUCTS_TABLE_NAME } = process.env;

exports.handler = async (event) => {
  console.log('Incoming request:', event);

  const { body } = event;
  const book = JSON.parse(body);

  if (!book.title) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: 'One or more parameter values were invalid: Missing the key title in the item',
      }),
    };
  }

  const params = {
    TableName: PRODUCTS_TABLE_NAME,
    Item: {
      id: book.id,
      title: book.title,
      price: book.price || 0,
      description: book.description,
    },
  };

  try {
    await dynamodb.put(params).promise();
    return {
      statusCode: 201,
      body: JSON.stringify(params.Item),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: error.statusCode || 500,
      body: JSON.stringify({
        error: error.message,
      }),
    };
  }
};
