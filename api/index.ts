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

        // Log the incoming request details for debugging
        console.log('Incoming request:', {
            method: req.method,
            path: url.pathname,
            query: url.search,
            headers: req.headers
        })

        // Create a new request object with the correct path
        const request = new Request(url, {
            method: req.method,
            headers: req.headers as HeadersInit,
            body: req.body ? JSON.stringify(req.body) : undefined
        });

        const elysia = await app.handle(request)

        // Response handling
        // If it's JSON, send it as JSON
        if (elysia.headers.get('content-type')?.includes('application/json')) {
            const data = await elysia.json()
            console.log("Sending JSON data")
            return res.status(elysia.status).json(data)
        }

        // Otherwise, send as text
        const text = await elysia.text()
        console.log("Sending JSON data")
        return res.status(elysia.status).send(text)

    } catch (error) {
        console.error('Error handling request:', error);
        return res.status(500).json({
            error: 'Internal Server Error'
        });
    }
}
