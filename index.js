const http = require('http');
const axios = require('axios');

const server = http.createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/solPrice') {
    res.writeHead(200, {
      'Content-Type': 'text/html',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });

    // Send initial HTML with auto-refreshing image
    res.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>SOL Price</title>
          <script>
            function updateImage() {
              const img = document.getElementById('solImage');
              img.src = '/solPrice/image?' + new Date().getTime();
            }
            setInterval(updateImage, 5000);
          </script>
        </head>
        <body>
          <img id="solImage" src="/solPrice/image" />
        </body>
      </html>
    `);
    res.end();
  } 
  else if (req.method === 'GET' && req.url.startsWith('/solPrice/image')) {
    try {
      const response = await axios.get("http://4.248.152.87/solPrice", { 
        responseType: 'arraybuffer',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      const imageBuffer = Buffer.from(response.data);
      res.writeHead(200, { 
        'Content-Type': 'image/png',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      res.end(imageBuffer);
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error');
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

const port = 3000;
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}/solPrice`);
});
