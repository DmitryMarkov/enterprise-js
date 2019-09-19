import '@babel/polyfill'
import express from 'express'
import bodyParser from 'body-parser'
import elasticsearch from 'elasticsearch'

import {
  checkContentTypeIsJson,
  checkContentTypeIsSet,
  checkEmptyPayload,
} from './middleware'
import { errorHandler } from './middleware/error-handler'

import ValidationError from './validators/errors/validation-error'
import injectHandlerDependencies from './utils/inject-handler-dependencies'

// handlers
import createUserHandler from './handlers/users/create'
import deleteUserHandler from './handlers/users/delete'
import retrieveUserHandler from './handlers/users/retrieve'

// engines
import createUserEngine from './engines/users/create'
import deleteUserEngine from './engines/users/delete'
import retrieveUserEngine from './engines/users/retrieve'

// validators
import createUserValidator from './validators/users/create'

const handlerToEngineMap = new Map([
  [createUserHandler, createUserEngine],
  [deleteUserHandler, deleteUserEngine],
  [retrieveUserHandler, retrieveUserEngine],
])

const handlerToValidatorMap = new Map([
  [createUserHandler, createUserValidator],
])

const app = express()

const client = new elasticsearch.Client({
  host: `${process.env.ELASTICSEARCH_PROTOCOL}://${process.env.ELASTICSEARCH_HOSTNAME}:${process.env.ELASTICSEARCH_PORT}`,
})

app.use(checkEmptyPayload)
app.use(checkContentTypeIsSet)
app.use(checkContentTypeIsJson)
app.use(bodyParser.json({ limit: 1e6 }))

app.post(
  '/users/',
  injectHandlerDependencies(
    createUserHandler,
    client,
    handlerToEngineMap,
    handlerToValidatorMap,
    ValidationError
  )
)

app.get(
  '/users/:userId',
  injectHandlerDependencies(
    retrieveUserHandler,
    client,
    handlerToEngineMap,
    handlerToValidatorMap,
    ValidationError
  )
)

app.delete(
  '/users/:userId',
  injectHandlerDependencies(
    deleteUserHandler,
    client,
    handlerToEngineMap,
    handlerToValidatorMap,
    ValidationError
  )
)

app.use(errorHandler)

const server = app.listen(process.env.SERVER_PORT, async () => {
  const indexParams = { index: process.env.ELASTICSEARCH_INDEX }
  const indexExists = await client.indices.exists(indexParams)
  if (!indexExists) {
    await client.indices.create(indexParams)
  }
  // eslint-disable-next-line no-console
  console.log(`API server listening on port ${process.env.SERVER_PORT}!`)
})

process.on('SIGTERM', () => {
  server.close(() => {
    process.exit(0)
  })
})
