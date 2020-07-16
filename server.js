const http = require('http')
const path = require('path')
const { exec } = require('child_process')

const bodyParser = require('body-parser')
const express = require('express')
const ecstatic = require('ecstatic')
const history = require('connect-history-api-fallback')

const app = express()
app.use(bodyParser.json())

app.post('//update', (req, res) => {
  if (req.body.ref === 'refs/heads/master') {
    exec('git pull https://cafbe4d081c2ffc3015dc82f78b1c750d245d7fd@github.com/apulis/AIArts.git', (err, result) => {
      if (!err) {
        exec('yarn build')
      }
    })
  }
})
app.use(history())

app.use(ecstatic({ root: path.join(__dirname, '../dist') }))

http.createServer(app).listen(process.argv[2] || 3084)
