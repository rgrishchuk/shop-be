import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

// eslint-disable-next-line import/extensions
import { BOOKS } from './product-service/books.js';

// Set the region
AWS.config.update({ region: 'eu-west-1' });

// Set up the DynamoDB client
const docClient = new AWS.DynamoDB.DocumentClient();

const PRODUCTS_TABLE = 'products';
const STOCKS_TABLE = 'stocks';

BOOKS.forEach(async (item) => {
  try {
    const id = uuidv4();
    await docClient.put({
      TableName: PRODUCTS_TABLE,
      Item: { ...item, id },
    }).promise();

    const count = Math.floor(Math.random() * 20) + 1;
    await docClient.put({
      TableName: STOCKS_TABLE,
      Item: { product_id: id, count },
    }).promise();
  } catch (error) {
    console.log(error);
  }
});
