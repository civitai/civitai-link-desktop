import { spawnSync } from 'node:child_process';
import {
  chmodSync,
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';

type PackageJson = {
  name: string;
  version: string;
  description: string;
  homepage?: string;
};

type CommandResult = {
  stdout: string;
  stderr: string;
};

const PRODUCT_NAME = 'Civitai Link';
const MAINTAINER = 'civitai.com';
const ARCH = 'arm64';
const DEBIAN_DEPENDS = [
  'libgtk-3-0',
  'libnotify4',
  'libnss3',
  'libxss1',
  'libxtst6',
  'xdg-utils',
  'libatspi2.0-0',
  'libuuid1',
  'libsecret-1-0',
];
const DEBIAN_RECOMMENDS = ['libappindicator3-1'];

const repoRoot = resolve(__dirname, '..');
const packageJson = JSON.parse(
  readFileSync(join(repoRoot, 'package.json'), 'utf8'),
) as PackageJson;
const unpackedDir = join(repoRoot, 'dist', 'linux-arm64-unpacked');
const stagingDir = join(repoRoot, 'dist', 'deb-arm64');
const outputDeb = join(
  repoRoot,
  'dist',
  `${packageJson.name}_${packageJson.version}_${ARCH}.deb`,
);
const installDir = join(stagingDir, 'opt', PRODUCT_NAME);

if (process.platform !== 'linux') {
  throw new Error('ARM64 .deb packaging requires Linux and dpkg-deb.');
}

if (!existsSync(unpackedDir)) {
  throw new Error(
    `Missing ${unpackedDir}. Run electron-builder with "--linux AppImage --arm64" first.`,
  );
}

rmSync(stagingDir, { recursive: true, force: true });
rmSync(outputDeb, { force: true });

mkdirSync(dirname(installDir), { recursive: true });
cpSync(unpackedDir, installDir, { recursive: true, preserveTimestamps: true });

const chromeSandbox = join(installDir, 'chrome-sandbox');
if (existsSync(chromeSandbox)) {
  chmodSync(chromeSandbox, 0o4755);
}

writeLauncher();
writeDesktopEntry();
writeIcon();
writeControlFile();
run('dpkg-deb', ['--build', '--root-owner-group', stagingDir, outputDeb]);

console.log(`Built ${outputDeb}`);

function writeLauncher(): void {
  const binDir = join(stagingDir, 'usr', 'bin');
  mkdirSync(binDir, { recursive: true });
  symlinkSync(
    `/opt/${PRODUCT_NAME}/${packageJson.name}`,
    join(binDir, packageJson.name),
  );
}

function writeDesktopEntry(): void {
  const desktopPath = join(
    stagingDir,
    'usr',
    'share',
    'applications',
    `${packageJson.name}.desktop`,
  );
  mkdirSync(dirname(desktopPath), { recursive: true });
  writeFileSync(
    desktopPath,
    [
      '[Desktop Entry]',
      `Name=${PRODUCT_NAME}`,
      `Comment=${packageJson.description}`,
      `Exec="/opt/${PRODUCT_NAME}/${packageJson.name}" %U`,
      'Terminal=false',
      'Type=Application',
      `Icon=${packageJson.name}`,
      `StartupWMClass=${PRODUCT_NAME}`,
      'Categories=Utility;',
      '',
    ].join('\n'),
  );
}

function writeIcon(): void {
  const sourceIcon = join(repoRoot, 'build', 'icon.png');
  if (!existsSync(sourceIcon)) {
    return;
  }

  const iconPath = join(
    stagingDir,
    'usr',
    'share',
    'icons',
    'hicolor',
    '512x512',
    'apps',
    `${packageJson.name}.png`,
  );
  mkdirSync(dirname(iconPath), { recursive: true });
  cpSync(sourceIcon, iconPath);
}

function writeControlFile(): void {
  const controlPath = join(stagingDir, 'DEBIAN', 'control');
  mkdirSync(dirname(controlPath), { recursive: true });

  const installedSize = run('du', ['-sk', stagingDir])
    .stdout.trim()
    .split(/\s+/)[0];
  const homepage = packageJson.homepage ?? 'https://www.civitai.com';

  writeFileSync(
    controlPath,
    [
      `Package: ${packageJson.name}`,
      `Version: ${packageJson.version}`,
      'Section: utils',
      'Priority: optional',
      `Architecture: ${ARCH}`,
      `Installed-Size: ${installedSize}`,
      `Maintainer: ${MAINTAINER}`,
      `Homepage: ${homepage}`,
      `Depends: ${DEBIAN_DEPENDS.join(', ')}`,
      `Recommends: ${DEBIAN_RECOMMENDS.join(', ')}`,
      `Description: ${packageJson.description}`,
      ` ${PRODUCT_NAME} packaged for Linux ARM64 from the upstream source build.`,
      '',
    ].join('\n'),
  );
}

function run(command: string, args: string[]): CommandResult {
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  if (result.status !== 0) {
    throw new Error(
      [
        `Command failed: ${command} ${args.join(' ')}`,
        result.stdout.trim(),
        result.stderr.trim(),
      ]
        .filter(Boolean)
        .join('\n'),
    );
  }

  return {
    stdout: result.stdout,
    stderr: result.stderr,
  };
}
