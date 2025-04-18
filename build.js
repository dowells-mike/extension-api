const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

// Path to your XLSM file
const xlsmPath = path.resolve(__dirname, '../data/csvratings.xlsm');
const outputDir = path.resolve(__dirname, 'public');
const outputFile = path.join(outputDir, 'playerRatings.json');

// Ensure the output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Helper function to extract cell value properly (handles formula results)
function getCellValue(cell) {
  if (!cell) return null;
  
  // If it's a formula cell, get the result
  if (cell.formula) {
    return cell.result;
  }
  
  // Handle different value types
  if (cell.value === null || cell.value === undefined) {
    return '';
  } else if (typeof cell.value === 'object' && cell.value.text) {
    return cell.value.text;
  } else if (typeof cell.value === 'object' && cell.value.result) {
    return cell.value.result;
  } else {
    return cell.value;
  }
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
    
    console.log("Found headers:", headers);

    // Process each row into the players array
    const players = [];
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      // Skip the header row
      if (rowNumber === 1) return;

      const playerData = {};
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        if (colNumber <= headers.length) {
          const header = headers[colNumber - 1];
          const key = typeof header === 'string' ? header.trim().toLowerCase() : `column${colNumber}`;
          playerData[key] = getCellValue(cell);
        }
      });

      // ONLY include rows with status 'd' (done)
      const status = String(playerData.status || '').toLowerCase();
      if (status !== 'd') return; // Skip any status that is NOT 'd'
      
      // Map the fields directly from the Excel file
      const player = {
        username: String(playerData.pname || ''),
        tier: String(playerData.tier || ''),
        overall: parseInt(playerData.overall) || 0,
        aiming: parseInt(playerData.aiming) || 0,
        dodging: parseInt(playerData.dodging) || 0,
        reflexes: parseInt(playerData.reflexes) || 0,
        movement: parseInt(playerData.movement) || 0,
        awareness: parseInt(playerData.awareness) || 0,
        reputation: parseInt(playerData.reputation) || 0,
        trait1: String(playerData.trait1 || ''),
        trait2: String(playerData.trait2 || ''),
        trait3: String(playerData.trait3 || ''),
        moderator: String(playerData.moderator || ''),
        ttoc: String(playerData.ttoc || '')
      };

      players.push(player);
    });

    console.log(`Included ${players.length} players with status 'd' (done)`);

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