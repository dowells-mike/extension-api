const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

// Path to your XLSM file (update this with the actual path)
const xlsmPath = path.resolve(__dirname, '../data/csvratings.xlsm');
const outputDir = path.resolve(__dirname, 'public');
const outputFile = path.join(outputDir, 'playerRatings.json');

// Ensure the output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Function to calculate overall rating
function calculateOverall(playerData) {
  // This is your formula for calculating overall - adjust as needed
  // For example: (AIM + DOD + REF + MOV + AWR) / 5
  const aim = parseFloat(playerData.aiming) || 0;
  const dod = parseFloat(playerData.dodging) || 0;
  const ref = parseFloat(playerData.reflexes) || 0;
  const mov = parseFloat(playerData.movement) || 0;
  const awr = parseFloat(playerData.awareness) || 0;
  
  // Example weighted formula (adjust weights according to your actual formula)
  const overall = Math.round((aim * 0.25 + dod * 0.2 + ref * 0.2 + mov * 0.15 + awr * 0.2));
  
  return overall;
}

async function convertXlsmToJson() {
  try {
    console.log(`Reading XLSM file: ${xlsmPath}`);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(xlsmPath);

    // Get the csvratings sheet
    const worksheet = workbook.getWorksheet('csvratings');
    if (!worksheet) {
      throw new Error('csvratings sheet not found in the XLSM file');
    }

    // Get the header row to use as keys
    const headerRow = worksheet.getRow(1);
    const headers = [];
    headerRow.eachCell({ includeEmpty: false }, (cell) => {
      headers.push(cell.value);
    });

    // Process each row into the players array
    const players = [];
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      // Skip the header row
      if (rowNumber === 1) return;

      const playerData = {};
      row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
        if (colNumber <= headers.length) {
          const key = headers[colNumber - 1].toString().toLowerCase();
          playerData[key] = cell.value !== null ? cell.value.toString() : '';
        }
      });

      // Check if the status indicates this player should be included
      // This assumes there's a status column like in the script.py
      const status = playerData.status ? playerData.status.toLowerCase() : '';
      if (status === 'd' || status === '') return; // Skip deleted or empty status
      
      // Map the fields to the expected format
      const player = {
        username: playerData.pname || playerData.username || '',
        tier: playerData.tier || '',
        // Calculate overall if it doesn't exist or recalculate based on your formula
        overall: playerData.overall ? parseInt(playerData.overall) : calculateOverall(playerData),
        aiming: parseInt(playerData.aiming || 0),
        dodging: parseInt(playerData.dodging || 0),
        reflexes: parseInt(playerData.reflexes || 0),
        movement: parseInt(playerData.movement || 0),
        awareness: parseInt(playerData.awareness || 0),
        reputation: parseInt(playerData.reputation || 0),
        trait1: playerData.trait1 || '',
        trait2: playerData.trait2 || '',
        trait3: playerData.trait3 || '',
        moderator: playerData.moderator || '',
        ttoc: playerData.ttoc || ''
      };

      players.push(player);
    });

    // Create the JSON structure
    const jsonData = {
      players: players,
      lastUpdated: new Date().toISOString()
    };

    // Write the JSON to a file
    fs.writeFileSync(outputFile, JSON.stringify(jsonData, null, 2));
    console.log(`Successfully converted XLSM to JSON: ${outputFile}`);
  } catch (error) {
    console.error('Error converting XLSM to JSON:', error);
    process.exit(1);
  }
}

convertXlsmToJson(); 