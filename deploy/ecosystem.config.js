// PM2 — despliegue nativo (sin Docker). Ver docs/GUIA_DESPLIEGUE_LINUX.md, Opción 2.
//   pm2 start deploy/ecosystem.config.js && pm2 save
// Las variables (DATABASE_URL, JWT_SECRET, ...) se leen del archivo .env de la raíz.
module.exports = {
  apps: [
    {
      name: 'uzdi-api',
      cwd: __dirname + '/..',
      script: 'dist/main.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '512M',
      time: true,
      env: {
        NODE_ENV: 'production',
        TZ: 'America/Guayaquil',
      },
      out_file: '/var/log/uzdi/api.out.log',
      error_file: '/var/log/uzdi/api.err.log',
    },
  ],
};
