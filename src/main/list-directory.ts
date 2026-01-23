import fs from 'fs';
import uniqBy from 'lodash/uniqBy';
import path from 'path';
import { getAllPaths, getRootResourcePath } from './store/paths';

const FILE_TYPES = ['.pt', '.pth', '.safetensors', '.ckpt', '.bin', '.onnx'];
const EXCLUDE_TYPES = ['/temp/', '.json', '.png'];

export function listDirectories() {
  const modelDirectory = getRootResourcePath();
  const modelDirectories = getAllPaths();

  console.log('=== LIST DIRECTORIES ===');
  console.log('Root path:', modelDirectory);
  console.log('Directories to scan:', modelDirectories);

  if (!modelDirectory) {
    console.warn('No root model directory set!');
    return [];
  }

  const allFiles: { pathname: string; filename: string }[] = [];

  for (const directory of modelDirectories) {
    if (!fs.existsSync(directory)) {
      console.log(`Directory does not exist, skipping: ${directory}`);
      continue;
    }

    try {
      console.log(`Scanning directory: ${directory}`);
      const files = walkSync(directory);
      console.log(`  Found ${files.length} files in ${directory}`);
      allFiles.push(...files);
    } catch (e) {
      console.error(`Failed to scan directory ${directory}:`, e);
    }
  }

  const uniqueFiles = uniqBy(allFiles, 'pathname');
  console.log(`listDirectories found ${uniqueFiles.length} unique files total`);
  return uniqueFiles;
}

export function listDirectory(directory: string) {
  if (!fs.existsSync(directory)) return [];
  return walkSync(directory);
}

function walkSync(
  dir: string,
  fileList: { pathname: string; filename: string }[] = [],
) {
  try {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      try {
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
          if (!EXCLUDE_TYPES.some((ex) => filePath.includes(ex))) {
            // Check excludes for directories too?
            walkSync(filePath, fileList);
          }
        } else {
          if (filterFileTypes(filePath)) {
            fileList.push({
              pathname: filePath,
              filename: file,
            });
          }
        }
      } catch (statErr) {
        // Ignore access errors
      }
    }
  } catch (err) {
    console.error(`Error walking directory ${dir}:`, err);
  }
  return fileList;
}

function filterFileTypes(filePath: string) {
  const fileStr = filePath.replace(/\\/g, '/');

  if (EXCLUDE_TYPES.some((x) => fileStr.includes(x))) {
    return false;
  }

  return FILE_TYPES.some((x) => fileStr.toLowerCase().endsWith(x)); // Ensure logic matches extension
}
