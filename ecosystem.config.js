module.exports = {
    apps: [{
        name: 'Bitrate',
        script: './index.js'
    }, {
        name: 'api-crawler'
        script:'./api-crawler.js'
    }],
    deploy: {
        production: {
            user: 'ubuntu',
            host: 'ec2-54-91-150-70.compute-1.amazonaws.com',
            key: '~/.ssh/bitrate_priv_key.pem',
            ref: 'origin/master',
            repo: 'git@github.com:alxgmpr/Bitrate.git',
            path: '/home/ubuntu/Bitrate',
            'post-deploy': 'npm install && pm2 startOrRestart ecosystem.config.js'
        }
    }
};