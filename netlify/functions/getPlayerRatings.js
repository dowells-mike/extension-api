const fs = require('fs');
const path = require('path');

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Allow requests from any origin
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS' // Allow GET and OPTIONS requests
};

exports.handler = async function(event, context) {
  // Handle preflight OPTIONS requests for CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }

  // Path to the JSON file generated during build
  const jsonPath = path.resolve(__dirname, '../../public/playerRatings.json');

  try {
    // Check if the file exists
    if (!fs.existsSync(jsonPath)) {
      console.error(`File not found at path: ${jsonPath}`);
      return {
        statusCode: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Player ratings data file not found on server.' })
      };
    }

    // Read the JSON file
    const jsonData = fs.readFileSync(jsonPath, 'utf8');
    const data = JSON.parse(jsonData); // Parse the JSON data

    // Optionally filter by username if provided in the query parameters
    const params = event.queryStringParameters;
    if (params && params.username) {
      const username = params.username.toLowerCase();

      // Find exact match first
      let matchedPlayer = data.players.find(
        player => player.username.toLowerCase() === username
      );

      // If no exact match, try partial match
      if (!matchedPlayer) {
        matchedPlayer = data.players.find(
          player => player.username.toLowerCase().includes(username) ||
                   username.includes(player.username.toLowerCase())
        );
      }

      if (matchedPlayer) {
        return {
          statusCode: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify({ player: matchedPlayer, lastUpdated: data.lastUpdated })
        };
      } else {
        return {
          statusCode: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Player not found' })
        };
      }
    }

    // Return the entire JSON data if no username specified
    return {
      statusCode: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: jsonData // Return the raw JSON string read from file
    };
  } catch (error) {
    console.error('Error serving player ratings:', error);
    return {
      statusCode: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal server error processing ratings' })
    };
  }
}; 