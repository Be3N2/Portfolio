module.exports = {
  apps: [{
    name: 'portfolio',
    script: './index.js'
  }],
  deploy: {
    production: {
      user: 'ubuntu',
      host: 'ec2-52-209-166-225.eu-west-1.compute.amazonaws.com',
      ref: 'origin/master',
      repo: 'github.com/Be3N2/Portfolio',
      path: '/home/ubuntu/server/code/Portfolio',
      'post-deploy': 'npm install && pm2 startOrRestart ecosystem.config.js'
    }
  }
}
