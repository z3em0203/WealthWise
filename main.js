const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os'); // Import os module to get network interfaces

const DATA_FILE = './data.json';

// Function to get the local IP address
const getLocalIPAddress = () => {
    const interfaces = os.networkInterfaces();
    for (const interfaceName in interfaces) {
        for (const iface of interfaces[interfaceName]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost'; // Fallback to localhost if no IP is found
};

const server = http.createServer((req, res) => {
    if (req.url.startsWith('/api/data')) { // Ensure the URL matches
        const userId = new URL(req.url, `http://${req.headers.host}`).searchParams.get('userId');
        if (!userId) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Missing userId' }));
            return;
        }

        if (req.method === 'GET') {
            // Read and return user-specific JSON data
            fs.readFile(DATA_FILE, 'utf8', (err, data) => {
                if (err) {
                    if (err.code === 'ENOENT') {
                        const defaultData = { [userId]: { expenses: [], dauerauftraege: [], income: [] } };
                        fs.writeFileSync(DATA_FILE, JSON.stringify(defaultData, null, 2), 'utf8');
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(defaultData[userId]));
                    } else {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Failed to read data file' }));
                    }
                } else {
                    const allData = JSON.parse(data);
                    const userData = allData[userId] || { expenses: [], dauerauftraege: [], income: [] };
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(userData));
                }
            });
        } else if (req.method === 'POST') {
            // Update user-specific JSON data
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', () => {
                try {
                    const newData = JSON.parse(body);
                    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
                        const allData = err && err.code === 'ENOENT' ? {} : JSON.parse(data || '{}');
                        allData[userId] = newData;
                        fs.writeFile(DATA_FILE, JSON.stringify(allData, null, 2), 'utf8', (err) => {
                            if (err) {
                                res.writeHead(500, { 'Content-Type': 'application/json' });
                                res.end(JSON.stringify({ error: 'Failed to write data file' }));
                            } else {
                                res.writeHead(200, { 'Content-Type': 'application/json' });
                                res.end(JSON.stringify({ message: 'Data saved successfully' }));
                            }
                        });
                    });
                } catch (err) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Invalid JSON data' }));
                }
            });
        } else {
            res.writeHead(405, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Method not allowed' }));
        }
    } else {
        // Serve static files
        let filePath = './website' + (req.url === '/' ? '/index.html' : req.url); // Ensure default file is served
        const extname = String(path.extname(filePath)).toLowerCase();
        const mimeTypes = {
            '.html': 'text/html',
            '.js': 'application/javascript',
            '.css': 'text/css',
            '.json': 'application/json',
        };

        const contentType = mimeTypes[extname] || 'application/octet-stream';

        fs.readFile(filePath, (error, content) => {
            if (error) {
                if (error.code === 'ENOENT') {
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    res.end('<h1>404 Not Found</h1>', 'utf-8');
                } else {
                    res.writeHead(500);
                    res.end(`Server Error: ${error.code}`);
                }
            } else {
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content, 'utf-8');
            }
        });
    }
});

const PORT = 8080;
const IP_ADDRESS = getLocalIPAddress(); // Dynamically get the local IP address

server.listen(PORT, () => {
    console.log(`Server running at http://${IP_ADDRESS}:${PORT}/`);
});