const { importProductsFile } = require('../handler');

const expectedUrl = 'https://s3.eu-west-1.amazonaws.com/my-bucket/uploaded/myFile.csv';

jest.mock('aws-sdk', () => ({
  S3: jest.fn(() => ({
    getSignedUrlPromise: () => expectedUrl,
  })),
}));

describe('importProductsFile', () => {
  test('returns a signed URL', async () => {
    const fakeEvent = {
      queryStringParameters: {
        name: 'myFile.csv',
      },
    };
    const response = await importProductsFile(fakeEvent);

    expect(response.statusCode).toBe(200);
    expect(response.headers).toEqual({ 'Access-Control-Allow-Origin': '*' });
    expect(response.body).toEqual(JSON.stringify(expectedUrl));
  });
});
