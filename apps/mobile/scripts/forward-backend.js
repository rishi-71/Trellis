const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function getAdbPath() {
  const localAppData = process.env.LOCALAPPDATA || '';
  const standardSdkPath = path.join(localAppData, 'Android', 'Sdk', 'platform-tools', 'adb.exe');
  if (fs.existsSync(standardSdkPath)) {
    return `"${standardSdkPath}"`;
  }
  return 'adb';
}

function runAdbReverse() {
  const adb = getAdbPath();
  try {
    const devicesOutput = execSync(`${adb} devices`, { encoding: 'utf-8' });
    const hasDevice = devicesOutput
      .split('\n')
      .slice(1)
      .some(line => line.includes('\tdevice'));

    if (hasDevice) {
      console.log('📱 Active Android device/emulator detected.');
      try {
        execSync(`${adb} reverse tcp:5000 tcp:5000`, { stdio: 'ignore' });
        console.log('✅ Port 5000 reversed (Backend 127.0.0.1:5000 bridge active).');
      } catch (_) {}

      try {
        execSync(`${adb} reverse tcp:8081 tcp:8081`, { stdio: 'ignore' });
        console.log('✅ Port 8081 reversed (Metro Bundler 127.0.0.1:8081 bridge active).');
      } catch (_) {}
    } else {
      console.log('ℹ️ No active Android device detected. Skipping port reverse.');
    }
  } catch (err) {
    // Non-fatal: Don't prevent Expo from starting if ADB is missing or fails
    console.log('ℹ️ ADB reverse check skipped (' + (err.message || 'not available') + ').');
  }
}

runAdbReverse();
