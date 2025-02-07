interface Config {
    clientOrigins: string[];
    redirectUri: string;
}

const configs: { [key: string]: Config } = {
    development: {
        clientOrigins: ['http://localhost:5173'],
        redirectUri: 'http://localhost:5173/callback'
    },
    production: {
        clientOrigins: ['https://wrapify.henryany.com'],
        redirectUri: 'https://wrapify.henryany.com/callback'
    }
};

const environment = process.env.NODE_ENV || 'development';

export const config: Config = configs[environment];
