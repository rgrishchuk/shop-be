const AWS = require('aws-sdk');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const { PRODUCTS_TABLE_NAME, PRODUCTS_SNS_TOPIC_ARN } = process.env;

exports.handler = async (event) => {
  console.log('Incoming request:', event);

  const books = event.Records.map((record) => JSON.parse(record.body)).filter(({ id }) => id);
  console.log(`Received ${books.length} books`);

  if (!books.length) {
    return;
  }

  const bookItems = books.map((book) => ({
    PutRequest: {
      Item: {
        id: book.id,
        title: book.title,
        description: book.description,
        price: book.price || 0,
      },
    },
  }));

  const params = {
    RequestItems: {
      [PRODUCTS_TABLE_NAME]: bookItems,
    },
  };

  try {
    const result = await dynamodb.batchWrite(params).promise();
    console.log('Batch write result:', result);

    const sns = new AWS.SNS();

    await Promise.all(books.map((book) => {
      const snsMessage = `New products have been added: ${book.title} ${book.price || 0}$`;
      const snsParams = {
        TopicArn: PRODUCTS_SNS_TOPIC_ARN,
        Message: JSON.stringify(snsMessage),
        MessageAttributes: {
          price: {
            DataType: 'Number',
            StringValue: book.price || 0,
          },
        },
      };
      console.log(`Sent SNS message for new products: ${snsMessage}`);
      return sns.publish(snsParams).promise();
    }));
  } catch (error) {
    console.log('Error:', error);
  }
};
