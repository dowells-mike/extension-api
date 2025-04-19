const fetch = require('node-fetch'); // Need to install node-fetch

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Allow requests from any origin
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS' // Allow GET and OPTIONS requests
};

// The public URL of your deployed JSON file
// Use the Netlify site URL environment variable if available, otherwise hardcode
const jsonFileUrl = `${process.env.URL || 'https://ttextensionapi.netlify.app'}/playerRatings.json`;

exports.handler = async function(event, context) {
  // Handle preflight OPTIONS requests for CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }

  try {
    // Fetch the JSON file from its public URL
    console.log(`Fetching player ratings from: ${jsonFileUrl}`);
    const response = await fetch(jsonFileUrl);

    if (!response.ok) {
      console.error(`Error fetching JSON file: ${response.status} ${response.statusText}`);
      return {
        statusCode: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: `Failed to fetch player ratings data file. Status: ${response.status}` })
      };
    }

    // Read the JSON data from the response
    const data = await response.json(); // Already parsed JSON

    // Optionally filter by username if provided in the query parameters
    const params = event.queryStringParameters;
    if (params && params.username) {
      const requestedUsernameLower = params.username.toLowerCase(); // Requested username

      // STRICT EXACT MATCH (case-insensitive)
      const matchedPlayer = data.players.find(
        player => player.username.toLowerCase() === requestedUsernameLower
      );

      if (matchedPlayer) {
        // Exact match found
        return {
          statusCode: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify({ player: matchedPlayer, lastUpdated: data.lastUpdated })
        };
      } else {
        // NO exact match found
        console.log(`Exact match not found for: ${params.username}`); // Add log
        return {
          statusCode: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Player not found (Exact match failed)' }) // Clarify error
        };
      }
    }

    // Return the entire JSON data if no username specified
    return {
      statusCode: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify(data) // Return the parsed data directly
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