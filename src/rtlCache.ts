import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';

/**
 * Emotion cache configured with stylis-plugin-rtl for RTL CSS flipping.
 * Used by CacheProvider when the app is in Hebrew (RTL) mode.
 */
export const rtlCache = createCache({
  key: 'muirtl',
  stylisPlugins: [prefixer, rtlPlugin],
});

/**
 * Default LTR Emotion cache (no RTL plugin).
 * Used by CacheProvider when the app is in English (LTR) mode.
 */
export const ltrCache = createCache({
  key: 'muiltr',
});
