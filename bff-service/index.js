const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const NodeCache = require('node-cache');
const cors = require('cors');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const cache = new NodeCache({ stdTTL: 120 });

app.use(express.json());

const corsOptions = {
  origin: '*',
};

app.use(cors(corsOptions));

app.all('/:recipient', async (req, res) => {
  const recipientName = req.params.recipient.toLowerCase();
  const recipientURL = process.env[recipientName];

  if (!recipientURL) {
    res.status(502).send('Cannot process request');
    return;
  }

  try {
    const { var1 } = req.query;
    const method = req.method.toLowerCase();
    const isProductsList = method === 'get' && recipientName === 'product' && !var1;
    const cachedResponse = cache.get(recipientName);

    if (isProductsList && cachedResponse) {
      console.log('Serving response from cache');
      res.status(cachedResponse.status).send(cachedResponse.data);
    } else {
      const url = var1 ? `${recipientURL}/${var1}` : recipientURL;
      const headers = {
        ...req.headers,
        host: new URL(recipientURL).host,
      };
      const data = req.body;

      delete headers['content-length'];

      const response = await axios({
        method,
        url,
        headers,
        ...(Object.keys(data).length > 0 && { data }),
      });

      if (isProductsList) {
        cache.set(recipientName, {
          status: response.status,
          data: response.data,
        });
      }

      res.status(response.status).send(response.data);
    }
  } catch (error) {
    if (error.response) {
      res.status(error.response.status).send(error.response.data);
    } else {
      res.status(500).send('Internal Server Error');
    }
  }
});

app.listen(port, () => {
  console.log(`BFF service listening at http://localhost:${port}`);
});
