import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createServer } from '../src/server.js'

const app = createServer()
const allowedOrigins = ['https://wrapify.henryany.com', 'http://localhost:5173'];

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        // Set CORS headers
        res.setHeader('Access-Control-Allow-Origin', req.headers.origin || allowedOrigins[0]);
        res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        return res.status(200).end();
    }

    try {
        // Check if origin is allowed
        const origin = req.headers.origin;
        if (origin && allowedOrigins.includes(origin)) {
            res.setHeader('Access-Control-Allow-Origin', origin);
            res.setHeader('Access-Control-Allow-Credentials', 'true');
        }

        // Handle the request
        const url = new URL(req.url!, `https://${req.headers.host}`);
        const request = new Request(url, {
            method: req.method,
            body: req.body ? JSON.stringify(req.body) : undefined
        });

        const elysia = await app.handle(request)

        // Set response headers and status
        res.status(elysia.status || 200)
        for (const [key, value] of elysia.headers.entries()) {
            res.setHeader(key, value)
        }

        return res.json(await elysia.json())
    } catch (error) {
        console.error('Error handling request:', error)
        return res.status(500).json({ error: 'Internal Server Error' })
    }
}
