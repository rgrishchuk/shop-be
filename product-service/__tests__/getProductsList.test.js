import { handler } from '../getProductsList';
import { BOOKS } from '../books';

describe('getProductsList', () => {
  test('should return correct value', async () => {
    const response = await handler();
    const result = JSON.parse(response.body);
    expect(response.statusCode).toBe(200);
    expect(result).toEqual(BOOKS);
  });
});
