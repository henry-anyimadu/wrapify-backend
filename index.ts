import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET
const REDIRECT_URI = 'http://localhost:5173/callback'

new Elysia()
    .use(cors())
    .get('/', () => "Hello World!")
    .listen(3000)
    .get('/api/spotify/login', () => {
        const scopes = ['user-read-private', 'user-read-email'].join(' ')
        const authUrl = `https://accounts.spotify.com/authorize?` +
            `client_id=${SPOTIFY_CLIENT_ID}` +
            `&response_type=code` +
            `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
            `&scope=${encodeURIComponent(scopes)}`

        return { authUrl }
    })
    .get('/api/spotify/callback', async ({ query }) => {
        const { code } = query

        // Exchange code for tokens
        const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`)}`
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code: code as string,
                redirect_uri: REDIRECT_URI
            })
        })

        const tokens = await tokenResponse.json()

        return {
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token
        }
    })
    }

console.log("Hello via Bun!");
