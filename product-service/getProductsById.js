import { BOOKS } from './books.js';

export const handler = async (event) => {
  const book = BOOKS.find(({ id }) => id === event.pathParameters.productId);
  if (!book) {
    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
      },
      body: JSON.stringify({ error: 'Product not found' }),
    };
  }

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
    },
    body: JSON.stringify(book),
  };
};
