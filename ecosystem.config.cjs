/**
 * PM2 ecosystem config for huanqi (Next.js web API + frontend).
 *
 * First-time setup:
 *   cp .env.example .env          # edit secrets for production
 *   npm install
 *   npm run build --workspace=web
 *   pm2 start ecosystem.config.cjs
 *
 * Common commands:
 *   pm2 status
 *   pm2 logs huanqi-web
 *   pm2 restart huanqi-web
 *   pm2 save && pm2 startup        # persist across reboots
 */
module.exports = {
  apps: [
    {
      name: "huanqi-web",
      cwd: __dirname,
      script: "npm",
      args: "run start --workspace=web",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      env_file: ".env",
      env: {
        NODE_ENV: "production",
        PORT: "3001",
        HOSTNAME: "0.0.0.0",
      },
      error_file: "logs/pm2-web-error.log",
      out_file: "logs/pm2-web-out.log",
      merge_logs: true,
      time: true,
    },
  ],
};
