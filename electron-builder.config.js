/**
 * Electron Builder Configuration
 * Creates distributable installers for Windows, macOS, and Linux
 */

module.exports = {
  appId: 'com.laketapps.permits',
  productName: 'Lake Tapps Permits',
  copyright: 'Copyright © 2024',

  // Build output directory
  directories: {
    output: 'dist',
    buildResources: 'build',
  },

  // Files to include in the build
  files: [
    'electron/**/*',
    'out/**/*',
    'package.json',
  ],

  // macOS configuration
  mac: {
    category: 'public.app-category.productivity',
    icon: 'build/icon.icns',
    target: [
      {
        target: 'dmg',
        arch: ['x64', 'arm64'],
      },
    ],
    hardenedRuntime: true,
    gatekeeperAssess: false,
    entitlements: 'build/entitlements.mac.plist',
    entitlementsInherit: 'build/entitlements.mac.plist',
  },

  // DMG configuration
  dmg: {
    contents: [
      {
        x: 130,
        y: 220,
      },
      {
        x: 410,
        y: 220,
        type: 'link',
        path: '/Applications',
      },
    ],
  },

  // Windows configuration
  win: {
    icon: 'build/icon.ico',
    target: [
      {
        target: 'nsis',
        arch: ['x64'],
      },
    ],
    publisherName: 'Lake Tapps Permits',
  },

  // Windows installer configuration
  nsis: {
    oneClick: true,
    perMachine: false,
    allowToChangeInstallationDirectory: false,
    deleteAppDataOnUninstall: false,
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    shortcutName: 'Lake Tapps Permits',
  },

  // Linux configuration
  linux: {
    icon: 'build/icons',
    category: 'Office',
    target: [
      {
        target: 'AppImage',
        arch: ['x64'],
      },
      {
        target: 'deb',
        arch: ['x64'],
      },
    ],
  },

  // Auto-update configuration (disabled for local-first app)
  publish: null,
};
