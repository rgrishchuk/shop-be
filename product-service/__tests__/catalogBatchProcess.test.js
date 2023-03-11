import AWS from 'aws-sdk';
import { handler } from '../catalogBatchProcess';

jest.mock('aws-sdk', () => {
  const dynamodbMock = {
    batchWrite: jest.fn().mockReturnThis(),
    promise: jest.fn(),
  };
  const snsMock = {
    publish: jest.fn().mockReturnThis(),
    promise: jest.fn(),
  };
  const SNS = jest.fn(() => snsMock);
  const DynamoDB = {
    DocumentClient: jest.fn(() => dynamodbMock),
  };
  return {
    SNS,
    DynamoDB,
  };
});

const books = [{
  id: '1',
  title: 'Book 1',
  description: 'This is book 1',
  price: 10,
}, {
  id: '2',
  title: 'Book 2',
  description: 'This is book 2',
}];

const log = jest.spyOn(console, 'log').mockImplementation();

describe('catalogBatchProcess', () => {
  let snsMock;
  let dynamodbMock;

  beforeEach(() => {
    jest.clearAllMocks();
    snsMock = new AWS.SNS();
    dynamodbMock = new AWS.DynamoDB.DocumentClient();
  });

  test('should return early if no books are received', async () => {
    const event = { Records: [] };
    await handler(event);
    expect(dynamodbMock.batchWrite).not.toHaveBeenCalled();
    expect(snsMock.publish).not.toHaveBeenCalled();
  });

  test('should put items to DynamoDB and publish SNS messages', async () => {
    const records = [{ body: JSON.stringify(books[0]) }, { body: JSON.stringify(books[1]) }];

    const event = {
      Records: records,
    };

    const mockBatchWrite = jest.fn((params) => {
      expect(params).toEqual({
        RequestItems: {
          [process.env.PRODUCTS_TABLE_NAME]: [
            {
              PutRequest: {
                Item: { ...books[0] },
              },
            },
            {
              PutRequest: {
                Item: { ...books[1], price: 0 },
              },
            },
          ],
        },
      });
      return {
        promise: () => Promise.resolve({}),
      };
    });

    dynamodbMock.batchWrite.mockImplementation(mockBatchWrite);

    const snsMessages = [];
    const mockPublish = jest.fn((params) => {
      snsMessages.push(params);
      return {
        promise: () => Promise.resolve({}),
      };
    });

    snsMock.publish.mockImplementation(mockPublish);

    await handler(event);

    expect(dynamodbMock.batchWrite).toHaveBeenCalledTimes(1);

    expect(snsMock.publish).toHaveBeenCalledTimes(2);
    expect(snsMessages).toEqual([{
      TopicArn: process.env.PRODUCTS_SNS_TOPIC_ARN,
      Message: JSON.stringify(`New products have been added: ${books[0].title} ${books[0].price}$`),
      MessageAttributes: {
        price: {
          DataType: 'Number',
          StringValue: books[0].price,
        },
      },
    }, {
      TopicArn: process.env.PRODUCTS_SNS_TOPIC_ARN,
      Message: JSON.stringify(`New products have been added: ${books[1].title} 0$`),
      MessageAttributes: {
        price: {
          DataType: 'Number',
          StringValue: 0,
        },
      },
    }]);
  });

  test('should catch and log errors', async () => {
    const event = { Records: [{ body: JSON.stringify(books[0]) }] };
    const error = new Error('DynamoDB error');
    dynamodbMock.batchWrite.mockImplementation(() => ({
      promise: () => Promise.reject(error),
    }));
    await handler(event);
    expect(log.mock.calls[2]).toEqual(['Error:', error]);
  });
});
