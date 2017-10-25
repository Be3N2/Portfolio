module.exports = {
   
  apps: [{
    name: 'portfolio',
    script: './index.js;'
  }],
  deploy : {
    production : {
      user : 'ubuntu',
      host : '212.83.163.1',
      ref  : 'origin/master',
      repo : 'github.com/Be3N2/Portfolio',
      path : '/home/ubuntu/server/code/Portfolio',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production'
    }
  }

};
