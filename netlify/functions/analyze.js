const https = require('https');

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  const { imageBase64 } = JSON.parse(event.body);
  const API_KEY = process.env.GOOGLE_VISION_API_KEY;

  const requestBody = JSON.stringify({
    requests: [{
      image: { content: imageBase64 },
      features: [
        { type: 'FACE_DETECTION', maxResults: 1 },
        { type: 'LABEL_DETECTION', maxResults: 10 },
        { type: 'IMAGE_PROPERTIES', maxResults: 5 }
      ]
    }]
  });

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'vision.googleapis.com',
      path: `/v1/images:annotate?key=${API_KEY}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': requestBody.length
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: 200,
          headers: { 'Access-Control-Allow-Origin': '*' },
          body: data
        });
      });
    });

    req.on('error', reject);
    req.write(requestBody);
    req.end();
  });
};
