import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'

const SPOTIFY_CLIENT_ID = process.env.VITE_SPOTIFY_CLIENT_ID
const SPOTIFY_CLIENT_SECRET = process.env.VITE_SPOTIFY_CLIENT_SECRET
const REDIRECT_URI = 'http://localhost:5173/callback'

new Elysia()
    .use(cors({
        origin: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD', 'PATCH'], // Specify allowed methods
        credentials: true,
        preflight: true,
        allowedHeaders: ['Content-Type', 'Authorization', 'Access-Control-Allow-Origin'], // Allowed headers
        maxAge: 5,
    }))
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

    if (!code) {
        throw new Error('No authorization code provided')
    }

    try {
        // Create authorization header
        const authHeader = Buffer.from(
            `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
        ).toString('base64')

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

        // Log the token response for debugging
        console.log('Token exchange successful:', {
            hasAccessToken: !!tokenData.access_token,
            hasRefreshToken: !!tokenData.refresh_token,
            tokenType: tokenData.token_type,
            expiresIn: tokenData.expires_in
        })

        return {
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token,
            expires_in: tokenData.expires_in,
            token_type: tokenData.token_type
        }
    } catch (error) {
        console.error('Error during token exchange:', error)
        throw new Error(`Token exchange failed: ${error.message}`)
    }
})

console.log("Hello via Bun!");
