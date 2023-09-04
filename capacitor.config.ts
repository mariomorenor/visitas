import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'jm.dev.visitas',
  appName: 'Visitas PUCESD',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
