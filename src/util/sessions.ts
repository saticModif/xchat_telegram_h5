import type { ApiSessionData } from '../api/types';

import {
  DEBUG, IS_SCREEN_LOCKED_CACHE_KEY,
  SESSION_USER_KEY,
} from '../config';

const DC_IDS = [1, 2, 3, 4, 5];
const TELEGRAM_ID_CACHE_KEY = 'telegram_id_cache';



export function hasStoredSession() {
  if (checkSessionLocked()) {
    return true;
  }

  const userAuthJson = localStorage.getItem(SESSION_USER_KEY);
  if (!userAuthJson) {
    return false;
  }

  try {
    const userAuth = JSON.parse(userAuthJson);
    return Boolean(userAuth && userAuth.id && userAuth.dcID);
  } catch (err) {
    // Do nothing.
    return false;
  }
}

export function storeSession(sessionData: ApiSessionData, currentUserId?: string) {
  const {
    mainDcId, keys, hashes, isTest,
  } = sessionData;

  localStorage.setItem(SESSION_USER_KEY, JSON.stringify({
    dcID: mainDcId,
    id: currentUserId,
    test: isTest,
  }));
  localStorage.setItem('dc', String(mainDcId));
  Object.keys(keys).map(Number).forEach((dcId) => {
    localStorage.setItem(`dc${dcId}_auth_key`, JSON.stringify(keys[dcId]));
  });

  if (hashes) {
    Object.keys(hashes).map(Number).forEach((dcId) => {
      localStorage.setItem(`dc${dcId}_hash`, JSON.stringify(hashes[dcId]));
    });
  }
}

export function clearStoredSession() {
  [
    SESSION_USER_KEY,
    'dc',
    ...DC_IDS.map((dcId) => `dc${dcId}_auth_key`),
    ...DC_IDS.map((dcId) => `dc${dcId}_hash`),
    ...DC_IDS.map((dcId) => `dc${dcId}_server_salt`),
  ].forEach((key) => {
    localStorage.removeItem(key);
  });
}

export function loadStoredSession(): ApiSessionData | undefined {
  if (!hasStoredSession()) {
    return undefined;
  }

  const userAuth = JSON.parse(localStorage.getItem(SESSION_USER_KEY)!);
  if (!userAuth) {
    return undefined;
  }
  const mainDcId = Number(userAuth.dcID);
  const isTest = userAuth.test;
  const keys: Record<number, string> = {};
  const hashes: Record<number, string> = {};

  DC_IDS.forEach((dcId) => {
    try {
      const key = localStorage.getItem(`dc${dcId}_auth_key`);
      if (key) {
        keys[dcId] = JSON.parse(key);
      }

      const hash = localStorage.getItem(`dc${dcId}_hash`);
      if (hash) {
        hashes[dcId] = JSON.parse(hash);
      }
    } catch (err) {
      if (DEBUG) {
        // eslint-disable-next-line no-console
        console.warn('Failed to load stored session', err);
      }
      // Do nothing.
    }
  });

  if (!Object.keys(keys).length) return undefined;

  return {
    mainDcId,
    keys,
    hashes,
    isTest,
  };
}

export function importTestSession() {
  const sessionJson = process.env.TEST_SESSION!;
  try {
    const sessionData = JSON.parse(sessionJson) as ApiSessionData & { userId: string };
    storeSession(sessionData, sessionData.userId);
  } catch (err) {
    if (DEBUG) {
      // eslint-disable-next-line no-console
      console.warn('Failed to load test session', err);
    }
  }
}

export function updateSessionUserId(currentUserId: string) {
  const sessionUserAuth = localStorage.getItem(SESSION_USER_KEY);
  if (!sessionUserAuth) return;

  const userAuth = JSON.parse(sessionUserAuth);
  userAuth.id = currentUserId;

  localStorage.setItem(SESSION_USER_KEY, JSON.stringify(userAuth));
}

// 新增：缓存telegramId的函数
export function cacheTelegramId(telegramId: string) {
  try {
    const userData = {
      id: telegramId,
      cachedAt: Date.now(),
    };
    localStorage.setItem(TELEGRAM_ID_CACHE_KEY, JSON.stringify(userData));
    
    if (DEBUG) {
      // eslint-disable-next-line no-console
      console.log('Telegram ID cached:', telegramId);
    }
  } catch (err) {
    if (DEBUG) {
      // eslint-disable-next-line no-console
      console.error('Failed to cache telegram ID:', err);
    }
  }
}

// 新增：获取缓存的telegramId
export function getCachedTelegramId(): string | null {
  try {
    const cachedData = localStorage.getItem(TELEGRAM_ID_CACHE_KEY);
    if (!cachedData) return null;

    const userData = JSON.parse(cachedData);
    return userData.id || null;
  } catch (err) {
    if (DEBUG) {
      // eslint-disable-next-line no-console
      console.error('Failed to get cached telegram ID:', err);
    }
    return null;
  }
}

// 新增：清除缓存的telegramId
export function clearCachedTelegramId() {
  try {
    localStorage.removeItem(TELEGRAM_ID_CACHE_KEY);
    
    if (DEBUG) {
      // eslint-disable-next-line no-console
      console.log('Cached telegram ID cleared');
    }
  } catch (err) {
    if (DEBUG) {
      // eslint-disable-next-line no-console
      console.error('Failed to clear cached telegram ID:', err);
    }
  }
}

function checkSessionLocked() {
  return localStorage.getItem(IS_SCREEN_LOCKED_CACHE_KEY) === 'true';
}
