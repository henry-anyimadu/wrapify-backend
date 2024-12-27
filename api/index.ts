import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createServer } from '../server'

const app = createServer()

export default async function handler(req: VercelRequest, res: VercelResponse) {
   try {
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
