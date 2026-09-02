import axios from 'axios';
import { shell } from 'electron';
import { sleep } from '../utils/concurrency-helpers';
import { AUTH_URL, OAUTH_CLIENT_ID, OAUTH_SCOPE } from './constants';
import { OAuthState } from './state';
import {
  OAuthTokens,
  TokenResponse,
  saveTokens,
  toTokens,
} from './token-store';

type DeviceCodeResponse = {
  device_code: string;
  user_code: string;
  verification_uri: string;
  verification_uri_complete: string;
  expires_in: number;
  interval: number;
};

const FORM_HEADERS = {
  'Content-Type': 'application/x-www-form-urlencoded',
};

const ERROR_MESSAGES: Record<string, string> = {
  access_denied: 'Sign in was denied on Civitai.',
  expired_token: 'Sign in timed out. Try again.',
  invalid_grant: 'Sign in failed. Try again.',
};

export class DeviceLoginCancelledError extends Error {
  constructor() {
    super('Sign in cancelled');
    this.name = 'DeviceLoginCancelledError';
  }
}

let controller: AbortController | null = null;

export function cancelDeviceLogin() {
  controller?.abort();
}
