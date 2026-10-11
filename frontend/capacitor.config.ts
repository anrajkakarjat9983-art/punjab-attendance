import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.punjabattendance.app',
  appName: 'Punjab Attendance & Payroll',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#3478E8",
      showSpinner: false
    }
  }
};

export default config;
