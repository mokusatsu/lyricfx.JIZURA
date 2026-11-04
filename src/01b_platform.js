/* Platform abstraction for Web (browser) and Electron (desktop) environments.
   Default implementation provides Web-safe fallback without Node.js dependencies. */
(() => {
  'use strict';
  window.J = window.J || {};

  J.platform = {
    name: 'browser',
    nativeMatting: false,
    nativeExport: false,
    capabilities: async () => ({
      version: 1,
      name: 'browser',
      nativeMatting: false,
      nativeExport: false,
      backends: ['browser'],
      encoders: [],
    }),
    pickMedia: null,
    ensureNativeAsset: null,
    generatePersonMask: null,
    pickExportTarget: null,
    startExport: null,
    writeFrame: null,
    finishExport: null,
    cancelJob: null,
    personModelProfile: () => (J.PERSON_MODEL && J.PERSON_MODEL.id) || 'rvm',
  };
})();
