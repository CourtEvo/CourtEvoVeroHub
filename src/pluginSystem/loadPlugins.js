// src/pluginSystem/loadPlugins.js
// @ts-nocheck

export default async function loadAllPlugins() {
  // find all index.js in /src/plugins (recursively)
  const context = require.context('../plugins', true, /index\.js$/);

  // load each and call its register()
  const regs = context.keys().map(async (path) => {
    try {
      const mod = await context(path);
      if (typeof mod.register === 'function') {
        mod.register();
        console.log('[loadPlugins] Registered plugin from', path);
      } else {
        console.warn('[loadPlugins] No register() in', path);
      }
    } catch (err) {
      console.error('[loadPlugins] Error loading', path, err);
    }
  });

  // wait for all
  await Promise.all(regs);
  console.log('[loadPlugins] All plugins loaded');
}
