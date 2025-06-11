// Script to start frontend on an alternative port (4000)
const { spawn } = require('child_process');
const os = require('os');

// Determine the platform-specific command
const npmCmd = os.platform() === 'win32' ? 'npm.cmd' : 'npm';

console.log('Starting frontend on alternative port 4000...');

// Set environment variables
process.env.PORT = '4000';

// Start frontend
const frontendProcess = spawn(npmCmd, ['run', 'dev'], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    VITE_PORT: '4000'
  }
});

frontendProcess.on('close', (code) => {
  console.log(`Frontend process exited with code ${code}`);
});

console.log('Use Ctrl+C to stop the server'); 