const AWS = require('aws-sdk');
const path = require('path');
const csvParser = require('csv-parser');

const s3 = new AWS.S3({ region: 'eu-west-1' });

module.exports = {
  importProductsFile: async (event) => {
    console.log('Incoming request:', event);

    const fileName = event.queryStringParameters.name;
    const params = {
      Bucket: process.env.BUCKET,
      Key: `uploaded/${fileName}`,
      Expires: 60,
      ContentType: 'text/csv',
    };

    const signedUrl = await s3.getSignedUrlPromise('putObject', params);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(signedUrl),
    };
  },
  importFileParser: async (event) => {
    console.log('Incoming request:', event);
    const bucketName = event.Records[0].s3.bucket.name;
    const objectKey = event.Records[0].s3.object.key;

    const params = {
      Bucket: process.env.BUCKET,
      Key: objectKey,
    };

    const parse = (stream) => new Promise((resolve, reject) => {
      const sqs = new AWS.SQS();
      stream.on('data', (data) => {
        sqs.sendMessage({
          QueueUrl: process.env.SQS_URL,
          MessageBody: JSON.stringify(data),
        }, (err) => {
          if (err) {
            console.log(`Error sending message to SQS: ${err}`);
          } else {
            console.log(`Record sent to SQS: ${JSON.stringify(data)}`);
          }
        });
      });
      stream.on('error', (error) => {
        console.log(error);
        reject();
      });
      stream.on('end', async () => {
        console.log('Finished parsing CSV file');
        try {
          const dstKey = path.join('parsed', path.basename(objectKey));

          const copyParams = {
            Bucket: bucketName,
            CopySource: `/${bucketName}/${objectKey}`,
            Key: dstKey,
          };

          await s3.copyObject(copyParams).promise();
          console.log(`File was copied to ${dstKey}`);
          await s3.deleteObject(params).promise();
          console.log(`File was deleted from ${objectKey}`);
        } catch (err) {
          console.log(`Error copying/deleting file: ${err}`);
        }
      });
    });

    const s3Stream = s3.getObject(params).createReadStream();

    await parse(s3Stream.pipe(csvParser()));
  },
};
