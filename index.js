const http = require('http');
const axios = require('axios');

// Cache to store the latest image buffer and timestamp
let imageCache = {
    buffer: null,
    lastUpdate: 0
};

// Function to fetch and update the image
async function updateImage() {
    try {
        const response = await axios.get("http://4.248.152.87/solPrice", {
            responseType: 'arraybuffer'
        });
        imageCache.buffer = Buffer.from(response.data);
        imageCache.lastUpdate = Date.now();
        console.log('Image cache updated successfully');
    } catch (error) {
        console.error('Error updating image cache:', error.message);
    }
}

// Set up the server
const server = http.createServer(async (req, res) => {
    if (req.method === 'GET' && req.url === '/solPrice') {
        try {
            // Check if we need to update the cache (older than 5 seconds)
            const now = Date.now();
            if (!imageCache.buffer || now - imageCache.lastUpdate >= 5000) {
                await updateImage();
            }

            if (imageCache.buffer) {
                res.writeHead(200, {
                    'Content-Type': 'image/png',
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                });
                res.end(imageCache.buffer);
            } else {
                throw new Error('No image available');
            }
        } catch (error) {
            console.error('Error serving image:', error.message);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error');
        }
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

const port = 3000;

// Initial image fetch
updateImage();

// Set up periodic updates every 5 seconds
setInterval(updateImage, 5000);

// Start the server
server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}/solPrice`);
});
