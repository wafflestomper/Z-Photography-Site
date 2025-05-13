require('dotenv').config();
const { exec } = require('child_process');
const path = require('path');

// Get the absolute path to the build script
const buildScriptPath = path.join(__dirname, 'build-instagram.js');

// Run the build script
exec(`node ${buildScriptPath}`, (error, stdout, stderr) => {
    if (error) {
        console.error(`Error updating Instagram feed: ${error}`);
        return;
    }
    if (stderr) {
        console.error(`Build script stderr: ${stderr}`);
        return;
    }
    console.log(`Instagram feed updated successfully: ${stdout}`);
}); 