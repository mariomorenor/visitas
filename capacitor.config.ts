import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.visitas',
  appName: 'Visitas PUCESD',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
