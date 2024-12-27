import type { VercelRequest, VercelResponse } from '@vercel/node'
import app from '../index'

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const elysia = app.handle(req)

    // Convert Elysia response to Vercel response
    const response = await elysia

    // Set status code
    res.status(response.status)

    // Set headers
    for (const [key, value] of response.headers.entries()) {
        res.setHeader(key, value)
    }

    // Send response
    return res.send(response.body)
}
