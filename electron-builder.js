const { execSync } = require('child_process');

const config = {
  appId: 'com.civitai.link',
  productName: 'Civitai Link',
  copyright: 'Copyright © year 2024',
  directories: {
    buildResources: 'build',
  },
  files: [
    '!**/.vscode/*',
    '!src/*',
    '!electron.vite.config.{js,ts,mjs,cjs}',
    '!{.eslintignore,.eslintrc.cjs,.prettierignore,.prettierrc.yaml,dev-app-update.yml,CHANGELOG.md,README.md}',
    '!{.env,.env.*,.npmrc,pnpm-lock.yaml}',
    '!{tsconfig.json,tsconfig.node.json,tsconfig.web.json}',
  ],
  asarUnpack: ['resources/**'],
  npmRebuild: false,
  nsis: {
    shortcutName: 'Civitai Link',
    uninstallDisplayName: 'Civitai Link',
    createDesktopShortcut: 'always',
    artifactName: 'civitai-link-1.10.13-setup.exe',
  },
  win: {
    executableName: 'Civitai Link',
  },
};

if (process.env.CODE_SIGN_SCRIPT_PATH) {
  // Dynamically get the version number from package.json
  const version = execSync('node -p "require(\'./package.json\').version"')
    .toString()
    .trim();
  const versionedExe = `civitai-link-${version}-setup.exe`;

  // config.nsis.artifactName = versionedExe;

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
