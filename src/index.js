import '@babel/polyfill'
import express from 'express'
import bodyParser from 'body-parser'
import elasticsearch from 'elasticsearch'

import ValidationError from './validators/errors/validation-error'
import createUserEngine from './engines/users/create'
import createUserHandler from './handlers/users/create'
import {
  checkContentTypeIsJson,
  checkContentTypeIsSet,
  checkEmptyPayload,
} from './middleware'
import { errorHandler } from './middleware/error-handler'
import createUserValidator from './validators/users/create'
import injectHandlerDependencies from './utils/inject-handler-dependencies'

const handlerToEngineMap = new Map([[createUserHandler, createUserEngine]])

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

app.use(errorHandler)

app.listen(process.env.SERVER_PORT, () => {
  console.log(`API listening on port ${process.env.SERVER_PORT}`)
})
