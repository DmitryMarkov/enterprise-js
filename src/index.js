import '@babel/polyfill'
import express from 'express'
import bodyParser from 'body-parser'

const app = express()

app.use(bodyParser.json({ limit: 1e6 }))

app.post('/users', (req, res) => {
  if (req.headers['content-length'] === '0') {
    res.status(400)
    res.set('Content-Type', 'application/json')
    res.json({
      message: 'Payload should not be empty',
    })
    return
  }
  if (req.headers['content-type'] !== 'application/json') {
    res.status(415)
    res.set('Content-Type', 'application/json')
    res.json({
      message:
        'The "Content-Type" header must always be "application/json"',
    })
  }
})

app.use((err, req, res, next) => {
  if (
    err instanceof SyntaxError &&
    err.status === 400 &&
    'body' in err &&
    err.type === 'entity.parse.failed'
  ) {
    res.status(400)
    res.set('Content-Type', 'application/json')

    res.json({
      message: 'Payload should be in JSON format',
    })
  }
  next()
})

app.listen(process.env.SERVER_PORT, () => {
  console.log(`API listening on port ${process.env.SERVER_PORT}`)
})
