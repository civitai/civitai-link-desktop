import { worker } from 'workerpool';
import { hash } from './hash';

// Note: Anything that accesses preload script wont work here
async function processTask(pathname: string) {
  const modelHash = await hash(pathname);

  return modelHash;
}

worker({
  processTask,
});
