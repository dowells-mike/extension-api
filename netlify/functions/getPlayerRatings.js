const fs = require('fs');
const path = require('path');

exports.handler = async function(event, context) {
  // Path to the JSON file
  const jsonPath = path.resolve(__dirname, '../../public/playerRatings.json');
  
  try {
    // Check if the file exists
    if (!fs.existsSync(jsonPath)) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Player ratings data not found' })
      };
    }
    
    // Read the JSON file
    const jsonData = fs.readFileSync(jsonPath, 'utf8');
    
    // Optionally filter by username if provided in the query parameters
    const params = event.queryStringParameters;
    if (params && params.username) {
      const data = JSON.parse(jsonData);
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
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*' // CORS support
          },
          body: JSON.stringify({ player: matchedPlayer, lastUpdated: data.lastUpdated })
        };
      } else {
        return {
          statusCode: 404,
          body: JSON.stringify({ error: 'Player not found' })
        };
      }
    }
    
    // Return the entire JSON data if no username specified
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*' // CORS support
      },
      body: jsonData
    };
  } catch (error) {
    console.error('Error serving player ratings:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
}; 