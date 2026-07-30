import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mapvx.gbfs',
  appName: 'GBFS MapVX',
  webDir: 'dist/gbfs-mapvx',
  server: {
    url: 'http://localhost:4200',
    cleartext: true,
  }
};

export default config;
