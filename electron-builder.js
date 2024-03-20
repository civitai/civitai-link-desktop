const { execSync } = require('child_process');

const config = {
  // your config goes here
  win: {
    target: ['nsis'],
  },
};

if (process.env.CODE_SIGN_SCRIPT_PATH) {
  // Dynamically get the version number from package.json
  const version = execSync('node -p "require(\'./package.json\').version"')
    .toString()
    .trim();
  const versionedExe = `civitai-link-${version}.exe`;

  config.win.sign = (configuration) => {
    console.log('Requested signing for ', configuration.path);

    // Only proceed if the versioned exe file is in the configuration path - skip signing everything else
    if (!configuration.path.includes(versionedExe)) {
      console.log(
        'Configuration path does not include the versioned exe, signing skipped.',
      );
      return true;
    }

    const scriptPath = process.env.CODE_SIGN_SCRIPT_PATH;

    try {
      // Execute the sign script synchronously
      const output = execSync(`node "${scriptPath}"`).toString();
      console.log(`Script output: ${output}`);
    } catch (error) {
      console.error(`Error executing script: ${error.message}`);
      if (error.stdout) {
        console.log(`Script stdout: ${error.stdout.toString()}`);
      }
      if (error.stderr) {
        console.error(`Script stderr: ${error.stderr.toString()}`);
      }
      return false;
    }

    return true; // Return true at the end of successful signing
  };

  // sign only for Windows 10 and above - adjust for your code as needed
  config.win.signingHashAlgorithms = ['sha256'];
}

module.exports = config;
