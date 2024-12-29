import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET
const REDIRECT_URI = 'https://wrapify.henryany.com/callback'

function validateEnv() {
    const required = ['SPOTIFY_CLIENT_ID', 'SPOTIFY_CLIENT_SECRET'];
    const missing = required.filter(key => !process.env[key]);

    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
}

export function createServer() {
    validateEnv()

    return new Elysia()
        .use(cors({
            origin: [
                'https://wrapify.henryany.com',  // Production
                'http://localhost:5173',         // Local development
            ],
            credentials: true,
            preflight: true,
            allowedHeaders: ['Content-Type', 'Authorization', 'Access-Control-Allow-Origin'], // Allowed headers
        }))
        .onRequest((request) => {
            console.log(`${request}`);
        })
        .onError((error) => {
            console.error('Server error:', error);
        })
        .get('/api/spotify/login', () => {
            const scopes = ['user-read-private', 'user-read-email', 'user-top-read'].join(' ')
            const authUrl = `https://accounts.spotify.com/authorize?` +
                `client_id=${SPOTIFY_CLIENT_ID}` +
                `&response_type=code` +
                `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
                `&scope=${encodeURIComponent(scopes)}`

            return { authUrl }
        })    .get('/api/spotify/callback', async ({ query }) => {
            const { code } = query
            console.log('Received authorization code:', code)

            if (!code) {
                throw new Error('No authorization code provided')
            }

            try {
                // Create authorization header
                const authHeader = Buffer.from(
                    `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
                ).toString('base64')
                console.log('Client ID present:', !!SPOTIFY_CLIENT_ID)
                console.log('Client Secret present:', !!SPOTIFY_CLIENT_SECRET)

                // Exchange code for tokens
                const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': `Basic ${authHeader}`
                    },
                    body: new URLSearchParams({
                        grant_type: 'authorization_code',
                        code: code as string,
                        redirect_uri: REDIRECT_URI
                    }).toString()
                })

                if (!tokenResponse.ok) {
                    const errorData = await tokenResponse.text()
                    console.error('Spotify token exchange failed:', errorData)
                    throw new Error(`Token exchange failed: ${tokenResponse.status} ${tokenResponse.statusText}`)
                }

            } catch (error) {
                console.error('Error during token exchange:', error)
            }
        })
}
