/*
proxy-server.mjs: This proxy server acts as an intermediary between the frontend application and any external API or resource.
Its main function is to manage HTTP requests in order to avoid CORS problems,
providing a local endpoint that receives an external URL as parameter and returns the data in JSON format.
*/

import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Cache-Control', 'Pragma']
}));

// Serve static files from the build directory
app.use(express.static('build'));

app.get('/proxy', async (req, res) => {
    const url = req.query.url;
    if (!url) {
        return res.status(400).json({ error: 'URL parameter is required' });
    }

    console.log(`Proxying request to: ${url}`);

    try {
        const response = await axios.get(url, {
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            },
            timeout: 10000
        });

        res.set({
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            'Access-Control-Allow-Origin': '*'
        });
        
        console.log(`Successfully received data from: ${url}`);
        res.json(response.data);
    } catch (error) {
        console.error('Proxy error:', error.message);
        
        if (error.response) {
            console.error(`Server responded with status: ${error.response.status}`);
            res.status(error.response.status).json({
                error: `API Error: ${error.response.status} ${error.response.statusText}`,
                details: error.response.data
            });
        } else if (error.request) {
            console.error('No response received from target server');
            res.status(504).json({
                error: 'No response from target server',
                details: error.message
            });
        } else {
            console.error('Error setting up request:', error.message);
            res.status(500).json({
                error: 'Internal proxy error',
                details: error.message
            });
        }
    }
});

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Proxy server is running' });
});

app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        error: 'Internal server error',
        details: err.message
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`App available at: http://localhost:${PORT}`);
    console.log(`Proxy service available at: http://localhost:${PORT}/proxy`);
    console.log(`Health check available at: http://localhost:${PORT}/health`);
});