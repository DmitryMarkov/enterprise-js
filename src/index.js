import '@babel/polyfill'
import express from 'express'
import bodyParser from 'body-parser'
import elasticsearch from 'elasticsearch'
import {
  checkContentTypeIsJson,
  checkContentTypeIsSet,
  checkEmptyPayload,
} from './middleware'
import { errorHandler } from './middleware/errorHandler'

const app = express()

const client = new elasticsearch.Client({
  host: `${process.env.ELASTICSEARCH_HOSTNAME}:${
    process.env.ELASTICSEARCH_PORT
  }`,
})

// console.log(process.env.NODE_ENV)

if (process.env.NODE_ENV === 'test') {
  process.env.ELASTICSEARCH_INDEX = process.env.ELASTICSEARCH_INDEX_TEST
  process.env.SERVER_PORT = process.env.SERVER_PORT_TEST
} else {
  process.env.ELASTICSEARCH_INDEX = process.env.ELASTICSEARCH_INDEX_DEV
  process.env.SERVER_PORT = process.env.SERVER_PORT_DEV
}

app.use(bodyParser.json({ limit: 1e6 }))
app.use(checkEmptyPayload)
app.use(checkContentTypeIsSet)
app.use(checkContentTypeIsJson)

app.post('/users/', (req, res) => {
  if (
    !Object.prototype.hasOwnProperty.call(req.body, 'email') ||
    !Object.prototype.hasOwnProperty.call(req.body, 'password')
  ) {
    res.status(400)
    res.set('Content-Type', 'application/json')
    res.json({
      message:
        'Payload must contain at least the email and password fields',
    })
    return
  }
  if (
    typeof req.body.email !== 'string' ||
    typeof req.body.password !== 'string'
  ) {
    res.status(400)
    res.set('Content-Type', 'application/json')
    res.json({
      message: 'The email and password fields must be of type string',
    })
    return
  }
  if (!/^[\w.+]+@\w+\.\w+$/.test(req.body.email)) {
    res.status(400)
    res.set('Content-Type', 'application/json')
    res.json({
      message: 'The email field must be a valid email',
    })
    return
  }
  client
    .index({
      index: process.env.ELASTICSEARCH_INDEX,
      type: 'user',
      body: req.body,
    })
    .then(
      function(result) {
        res.status(201)
        res.set('Content-Type', 'text/plain')
        res.send(result._id)
      },
      function(err) {
        res.status(500)
        res.set('Content-Type', 'application/json')
        res.json({
          message: 'Internal Server Error',
          error: err,
        })
      }
    )
})

app.use(errorHandler)

app.listen(process.env.SERVER_PORT, () => {
  console.log(`API listening on port ${process.env.SERVER_PORT}`)
})
