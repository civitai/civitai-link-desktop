import { worker } from 'workerpool';
import { hash } from './hash';
import { readMetadata } from './utils/read-metadata';

// Note: Anything that accesses preload script wont work here
async function processTask(pathname: string) {
  const modelHash = await hash(pathname);

  // TODO: Catch errors
  // TODO: Add this to download-file new one
  const metadata = await readMetadata(pathname);

  return { modelHash, metadata };
}

worker({
  processTask,
});
