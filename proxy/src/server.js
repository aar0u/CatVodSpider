import { createServer } from 'http';
import url from 'url';
import browser from './browser.js';

const CACHE = {};
const TIME_UNITS = {
    HOUR: 60 * 60 * 1000,
    DAY: 24 * 60 * 60 * 1000
};
const CACHE_TTL = 2 * TIME_UNITS.HOUR;

const server = createServer(async (req, res) => {
    try {
        const parsedUrl = url.parse(req.url, true);
        const targetUrl = parsedUrl.query.url;

        const cached = CACHE[targetUrl];
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
            console.log(`Cache hit for ${targetUrl}`);
            res.end(cached.url);
            return;
        }

        if (!targetUrl) {
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            return res.end('Missing url parameter');
        }

        res.writeHead(200, {
            'Content-Type': 'text/plain'
        });

        await browser(targetUrl, (mediaUrl) => {
            CACHE[targetUrl] = {
                url: mediaUrl,
                timestamp: Date.now()
            };
            res.end(`${mediaUrl}`);
        })
    } catch (err) {
        res.end(`Error: ${err.message}`);
    }
});

server.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});
