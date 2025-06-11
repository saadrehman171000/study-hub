const { spawn } = require('child_process');
const path = require('path');
const os = require('os');

// Determine the platform-specific command
const npmCmd = os.platform() === 'win32' ? 'npm.cmd' : 'npm';

// Function to start a process with the given command and args
function startProcess(command, args, cwd, name) {
  console.log(`Starting ${name}...`);
  
  const process = spawn(command, args, {
    cwd,
    stdio: 'inherit',
    shell: true
  });
  
  process.on('close', (code) => {
    console.log(`${name} process exited with code ${code}`);
  });
  
  return process;
}

// Current directory
const rootDir = __dirname;
const backendDir = path.join(rootDir, 'backend');

console.log('Restarting backend server...');

// Start backend
const backendProcess = startProcess(
  npmCmd, 
  ['run', 'dev:fixed'],
  backendDir,
  'Backend'
);

// Handle process termination
process.on('SIGINT', () => {
  console.log('Shutting down backend...');
  backendProcess.kill();
  process.exit(0);
});

console.log('Backend server restarting. Press Ctrl+C to stop.'); 