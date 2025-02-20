import express from 'express';
import cors from 'cors';
import axios from 'axios';
import fetch from 'node-fetch';

const app = express();

// Enable CORS for all requests
app.use(cors());

// Proxy endpoint
app.get('/proxy', async (req, res) => {
    const url = req.query.url;
    if (!url) {
        return res.status(400).json({ error: 'URL parameter is required' });
    }

    try {
        const response = await axios.get(url, {
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0'
            }
        });

        res.set({
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        });
        res.json(response.data);
    } catch (error) {
        console.error('Proxy error:', error.message);
        if (error.response) {
            res.status(error.response.status).json({
                error: `API Error: ${error.response.status} ${error.response.statusText}`,
                details: error.response.data
            });
        } else if (error.request) {
            res.status(504).json({
                error: 'No response from target server',
                details: error.message
            });
        } else {
            res.status(500).json({
                error: 'Internal proxy error',
                details: error.message
            });
        }
    }
});

// Generic error handling
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        error: 'Internal server error',
        details: err.message
    });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Proxy server running on port ${PORT}`);
});