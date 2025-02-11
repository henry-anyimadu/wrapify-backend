import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET
const isDevEnv = process.env.NODE_ENV
const REDIRECT_URI = isDevEnv
    ? 'http://localhost:5173/callback'
    : 'https://wrapify.henryany.com/callback'

export function createServer() {
    const app = new Elysia()
        .use(cors({
            origin: isDevEnv
                ? ['http://localhost:5173']
                : ['https://wrapify.henryany.com'],
            credentials: true,
            preflight: true,
            allowedHeaders: ['Content-Type', 'Authorization', 'Access-Control-Allow-Origin'], // Allowed headers
        }))
        // Add this to log all requests
        .onRequest((request) => {
            console.log('Request received:', request)
        })
        .onError((error) => {
            console.error('Server error:', error);
        })
        .get('/', () => {
            return { status: 'ok', message: 'Server is running' }
        })
        .get('/api/spotify/login', () => {
            const scopes = ['user-read-private', 'user-read-email', 'user-top-read'].join(' ')
            const authUrl = `https://accounts.spotify.com/authorize?` +
                `client_id=${SPOTIFY_CLIENT_ID}` +
                `&response_type=code` +
                `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
                `&scope=${encodeURIComponent(scopes)}`

            return { authUrl }
        })
        .get('/api/spotify/callback', async ({ query }) => {
            const { code } = query
            console.log('Received authorization code')

            if (!code) {
                throw new Error('No authorization code provided')
            }

            try {
                // Create authorization header
                const authHeader = Buffer.from(
                    `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
                ).toString('base64')
                console.log('Client ID present')
                console.log('Client Secret present')

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

                const tokenData = await tokenResponse.json()

                return {
                    access_token: tokenData.access_token,
                    refresh_token: tokenData.refresh_token,
                    expires_in: tokenData.expires_in
                }

            } catch (error) {
                console.error('Error during token exchange:', error)
                throw error;
            }
        })

    return app
}

if (process.env.NODE_ENV === 'development') {
    const app = createServer()
    app.listen(3000, () => {
        console.log('Development server is running at http://localhost:3000')
    })
}


