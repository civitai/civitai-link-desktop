import { setSDType } from '../store/paths';

export function eventSetStableDiffusion(_, type: string) {
  setSDType(type);
}
