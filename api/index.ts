import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createServer } from '../src/server.js'

const app = createServer()

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        // Convert VercelRequest to standard Request
        const request = new Request(req.url!, {
            method: req.method,
            headers: new Headers(req.headers as HeadersInit),
            body: req.body ? JSON.stringify(req.body) : null
        });

        const response = await app.handle(request)

        // Set CORS headers
        if (req.headers.origin && ['https://wrapify.henryany.com', 'http://localhost:5173'].includes(req.headers.origin)) {
            res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
            res.setHeader('Access-Control-Allow-Credentials', 'true');
        }

        // Convert Elysia response to Vercel response
        res.status(response.status || 200);

        for (const [key, value] of response.headers.entries()) {
            res.setHeader(key, value);
        }

        return res.send(response.body);
    } catch (error) {
        console.error('Error handling request:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
