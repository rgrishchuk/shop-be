import { BOOKS } from './books.js';

export const handler = async () => ({
  statusCode: 200,
  headers: {
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET',
  },
  body: JSON.stringify(BOOKS),
});
