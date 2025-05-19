/*
unified-loader.js: This module provides a single function (‘unifiedFileLoader’) that loads JSON data from different sources,
including local files, external URLs and API endpoints. Use a local proxy to avoid CORS issues
and normalizes the data so that it always returns a consistent JSON object.
*/


import axios from 'axios';

export const unifiedFileLoader = async (fileParam) => {
  if (!fileParam) return null;

  try {
    // Determine if the input is a URL or API endpoint
    const isExternalUrl = fileParam.startsWith('http://') || fileParam.startsWith('https://');
    
    // Choose the appropriate URL based on the type
    let fetchUrl;
    if (isExternalUrl) {
      // Use the local proxy for ANY external URL
      fetchUrl = `./proxy?url=${encodeURIComponent(fileParam)}`;
    } else {
      fetchUrl = fileParam;
    }

    // Make the request with appropriate headers
    const response = await axios.get(fetchUrl, {
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });

    // Process the response data
    let processedData = response.data;
    
    // Handle API-specific response structure
    if (processedData.result && typeof processedData.result === 'string') {
      try {
        processedData = JSON.parse(processedData.result);
      } catch (e) {
        console.warn('Failed to parse result string, using raw data');
      }
    }

    return {
      data: processedData,
      source: fileParam
    };
  } catch (error) {
    console.error('Error loading file:', error);
    throw new Error(`Failed to load file: ${error.message}`);
  }
};