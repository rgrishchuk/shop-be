import { handler } from '../getProductsById';
import { BOOKS } from '../books';

describe('getProductsById', () => {
  test('should return correct value', async () => {
    const response = await handler({ pathParameters: { productId: '1' }});
    const result = JSON.parse(response.body);
    expect(response.statusCode).toBe(200);
    expect(result).toEqual(BOOKS[0]);
  });

  test('should return error', async () => {
    const response = await handler({ pathParameters: { productId: 'test' }});
    expect(response.statusCode).toBe(404);
    const result = JSON.parse(response.body);
    expect(result).toEqual({ error: 'Product not found' });
  });
});

