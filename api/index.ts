import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createServer } from '../src/server.js'

const app = createServer()
const allowedOrigins = ['https://wrapify.henryany.com', 'http://localhost:5173'];

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', 'https://wrapify.henryany.com');
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

       const elysia = await app.handle(req)

       // Convert Elysia response to Vercel response
       const response = await elysia

       // Set status code
       res.status(elysia.status || 200)

       // Set headers
       for (const [key, value] of response.headers.entries()) {
           res.setHeader(key, value)
       }

       // Send response
       return res.send(elysia.body)

   } catch (error) {
        console.error('Error handling request:', error)
        return res.status(500).json({ error: 'Internal Server Error' })
    }
}
