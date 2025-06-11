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
    stdio: 'pipe',
    shell: true
  });
  
  process.stdout.on('data', (data) => {
    console.log(`[${name}] ${data}`);
  });
  
  process.stderr.on('data', (data) => {
    console.error(`[${name}] ${data}`);
  });
  
  process.on('close', (code) => {
    console.log(`${name} process exited with code ${code}`);
  });
  
  return process;
}

// Current directory
const rootDir = __dirname;
const backendDir = path.join(rootDir, 'backend');
const frontendDir = rootDir;

console.log('Starting servers...');

// Start backend
const backendProcess = startProcess(
  npmCmd, 
  ['run', 'dev:fixed'],
  backendDir,
  'Backend'
);

// Wait 3 seconds for backend to start before starting frontend
setTimeout(() => {
  // Start frontend
  const frontendProcess = startProcess(
    npmCmd,
    ['run', 'dev'],
    frontendDir,
    'Frontend'
  );
  
  // Handle process termination
  process.on('SIGINT', () => {
    console.log('Shutting down servers...');
    backendProcess.kill();
    frontendProcess.kill();
    process.exit(0);
  });
}, 3000);

console.log('Servers starting. Press Ctrl+C to stop.'); 