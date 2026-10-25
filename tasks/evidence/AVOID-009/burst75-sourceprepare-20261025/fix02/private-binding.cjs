"use strict";
// Harness-owned closure only. No J/public cut recipe property participates.
module.exports = function createBurst74Binding() {
  const bindings = new WeakMap();
  const fail = code => { throw Object.assign(new Error(code), {code}); };
  const excluded = env => env.cut.emphasis || env.cut.placementLocked ||
    env.cut.areaMode !== 'auto' || env.cut.lockedAreas || env.cut.lockedEffects;
  const off = env => env.plan?.lyricAvoidanceIndex?.enabled !== true || env.cut.autoPlacement === false;
  return Object.freeze({
    withRecipe(env, recipe, fn) {
      if (!env || env.cut?.layout !== 'burst' || typeof fn !== 'function' || bindings.has(env)) fail('BURST74_BINDING');
      if (excluded(env)) fail('BURST74_PRESERVED_PRIORITY');
      if (!recipe || !Number.isFinite(recipe.dx) || !Number.isFinite(recipe.dy) ||
          (recipe.enabled !== undefined && typeof recipe.enabled !== 'boolean')) fail('BURST74_RECIPE');
      const binding = Object.freeze({cut: env.cut, W: env.W, H: env.H,
        dx: recipe.dx, dy: recipe.dy, enabled: recipe.enabled !== false});
      bindings.set(env, binding);
      try { return fn(); } finally { bindings.delete(env); }
    },
    offsetFor(env) {
      const b = bindings.get(env);
      if (!b) return null;
      if (b.cut !== env.cut || b.W !== env.W || b.H !== env.H) fail('BURST74_ENV_CHANGED');
      if (excluded(env) || off(env) || !b.enabled || (b.dx === 0 && b.dy === 0)) return null;
      return b;
    }
  });
};
