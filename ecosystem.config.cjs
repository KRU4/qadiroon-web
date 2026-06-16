module.exports = {
  apps: [
    {
      name: "Qadroon News",
      script: "server/index.js",
      node_args: "--env-file=.env",
      env: {
        PORT: 8884,
        NODE_ENV: "production",
      },
      // Log settings
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      error_file: "./logs/pm2-error.log",
      out_file: "./logs/pm2-out.log",
      merge_logs: true,
      max_size: "10M",
      // Auto-restart
      autorestart: true,
      watch: false,
      max_restarts: 10,
      restart_delay: 1000,
    },
  ],
};
