import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.aura.ambientradio',
  appName: 'AURA Ambient Radio',
  webDir: 'public',
  server: {
    url: 'http://192.168.29.195:3000',
    cleartext: true,
    allowNavigation: ['*']
  }
};

export default config;
