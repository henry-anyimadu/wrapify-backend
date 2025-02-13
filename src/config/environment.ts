interface Config {
    clientOrigins: string[];
    redirectUri: string;
    apiUrl: string;
}

const configs: { [key: string]: Config } = {
    development: {
        clientOrigins: ['http://localhost:5173'],
        redirectUri: 'http://localhost:5173/callback',
        apiUrl: 'http://localhost:3000',
    },
    production: {
        clientOrigins: ['https://wrapify.henryany.com'],
        redirectUri: 'https://wrapify.henryany.com/callback',
        apiUrl: 'https://wrapify-backend.vercel.app',
    }
};

const environment = process.env.NODE_ENV;

export const config: Config = configs[environment];
