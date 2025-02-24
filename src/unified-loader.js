import axios from 'axios';

export const unifiedFileLoader = async (fileParam) => {
  if (!fileParam) return null;

  try {
    // Determine if the input is a URL or API endpoint
    const isExternalUrl = fileParam.startsWith('http://') || fileParam.startsWith('https://');
    const isApiEndpoint = fileParam.includes('yprov.vm.fedcloud.eu') || 
                         fileParam.includes('/api/') ||
                         fileParam.includes('/v0/');

    // Choose the appropriate URL based on the type
    let fetchUrl;
    if (isApiEndpoint) {
      fetchUrl = `http://localhost:3001/proxy?url=${encodeURIComponent(fileParam)}`;
    } else if (isExternalUrl) {
      // Per gli URL esterni, usa comunque il proxy per evitare problemi CORS
      fetchUrl = `http://localhost:3001/proxy?url=${encodeURIComponent(fileParam)}`;
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