module.exports = {
  apps: [
    {
      name: 'san-lorenzo-inventario',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      cwd: '/var/www/san-lorenzo-inventario',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3005,
      },
      env_file: '/var/www/san-lorenzo-inventario/.env.production',
      autorestart: true,
      max_memory_restart: '1G',
      error_file: '/var/log/pm2/san-lorenzo-error.log',
      out_file: '/var/log/pm2/san-lorenzo-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
  ],
}
