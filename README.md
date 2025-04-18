# Tank Trouble Player Ratings API

This API serves player rating data for the Tank Trouble Player Viewer extension. It converts player data from an XLSM file to JSON and provides an API endpoint to access this data.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Place your XLSM file at `../data/csvratings.xlsm` relative to this directory.

3. Run the build script to generate the JSON file:
   ```bash
   npm run build
   ```

4. Test locally:
   ```bash
   npx netlify dev
   ```

## Deployment to Netlify

1. Create a new Netlify site from this directory:
   ```bash
   npx netlify login
   npx netlify init
   ```

2. Deploy to Netlify:
   ```bash
   npx netlify deploy --prod
   ```

3. Set up continuous deployment by connecting to a GitHub repository.

## API Endpoints

- `GET /api/getPlayerRatings` - Get all player ratings
- `GET /api/getPlayerRatings?username=playername` - Get ratings for a specific player

## Updating Player Data

1. Update the XLSM file with new player data.
2. Run the build script to regenerate the JSON:
   ```bash
   npm run build
   ```
3. Commit and push the changes to your GitHub repository.
4. Netlify will automatically rebuild and deploy the updated data.

## Formula for Overall Rating

The overall rating is calculated using a weighted average of player stats:
- Aiming: 25%
- Dodging: 20%
- Reflexes: 20%
- Movement: 15%
- Awareness: 20%

You can adjust this formula in the `calculateOverall` function in `build.js`. 