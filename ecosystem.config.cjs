module.exports = {
  apps: [
    {
      name: 'catrion-site-api',
      cwd: './backend',
      script: 'dist/server.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3333
      }
    }
  ]
};
