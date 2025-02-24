import axios from 'axios';

// Funzione serverless per il proxy
export async function handler(event) {
    const url = event.queryStringParameters.url; // Ottieni il parametro URL
    if (!url) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'URL parameter is required' }),
        };
    }

    try {
        const response = await axios.get(url, {
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0',
            },
        });

        return {
            statusCode: 200,
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
            },
            body: JSON.stringify(response.data),
        };
    } catch (error) {
        console.error('Proxy error:', error.message);
        if (error.response) {
            return {
                statusCode: error.response.status,
                body: JSON.stringify({
                    error: `API Error: ${error.response.status} ${error.response.statusText}`,
                    details: error.response.data,
                }),
            };
        } else if (error.request) {
            return {
                statusCode: 504,
                body: JSON.stringify({
                    error: 'No response from target server',
                    details: error.message,
                }),
            };
        } else {
            return {
                statusCode: 500,
                body: JSON.stringify({
                    error: 'Internal proxy error',
                    details: error.message,
                }),
            };
        }
    }
}
