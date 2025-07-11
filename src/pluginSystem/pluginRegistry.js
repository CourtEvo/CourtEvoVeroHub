// src/pluginSystem/pluginRegistry.js
import React from 'react';

// Internal stores
const navItems = [];
const views = {};

/**
 * Plugins (or core modules) call this to register themselves.
 * @param {Object} options
 * @param {string} options.key      Unique view key
 * @param {string} options.label    Label shown in nav
 * @param {React.ReactNode} options.icon  Icon component
 * @param {() => Promise<{ default: React.ComponentType }>} options.loadView  Dynamic import
 */
export function registerPlugin({ key, label, icon, loadView }) {
  if (views[key]) {
    console.warn(`Duplicate plugin/view registration: ${key}`);
    return;
  }
  navItems.push({ key, label, icon });
  // wrap loadView in React.lazy
  views[key] = React.lazy(loadView);
}

/** @returns {Array<{key,label,icon}>} */
export function getNavItems() {
  return [...navItems];
}

/** @param {string} key */
export function getPluginView(key) {
  return views[key] || null;
}
