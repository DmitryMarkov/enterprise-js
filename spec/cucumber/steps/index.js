import assert from 'assert'
import { config } from 'dotenv'
import superagent from 'superagent'
import { When, Then } from 'cucumber'
import elasticsearch from 'elasticsearch'
import { convertStringToArray, getValidPayload } from './utils'

const env = config().parsed

const client = new elasticsearch.Client({
  host: `${env.ELASTICSEARCH_HOSTNAME}:${env.ELASTICSEARCH_PORT}`,
})

When(
  /^the client creates a (GET|POST|PATCH|PUT|DELETE|OPTIONS|HEAD) request to ([/\w-:.]+)$/,
  function(method, path) {
    // console.log(env.NODE_ENV)
    this.request = superagent(
      method,
      `${env.SERVER_HOSTNAME}:${env.SERVER_PORT_TEST}${path}`
    )
  }
)

When(/^attaches a generic (.+) payload$/, function(payloadType) {
  switch (payloadType) {
    case 'malformed':
      this.request
        .send('{ "email": "test@test.com", name: }')
        .set('Content-Type', 'application/json')
      break
    case 'non-JSON':
      this.request
        .send(
          '<?xml version="1.0 encoding="UTF-8" ?><email>test@test.com</email>'
        )
        .set('Content-Type', 'text/xml')
      break
    case 'empty':
    default:
  }
  return undefined
})

When(/^sends the request$/, function(cb) {
  this.request
    .then(response => {
      this.response = response.res
      cb()
    })
    .catch(err => {
      this.response = err.response
      cb()
    })
})

When(/^without a (?:"|')([\w-]+)(?:"|') header set$/, function(headerName) {
  this.request.unset(headerName)
})

When(
  /^attaches an? (.+) payload which is missing the ([a-zA-Z0-9, ]+) fields?$/,
  function(payloadType, missingFields) {
    this.requestPayload = getValidPayload(payloadType)
    const fieldsToDelete = convertStringToArray(missingFields)
    fieldsToDelete.forEach(field => delete this.requestPayload[field])
    this.request
      .send(JSON.stringify(this.requestPayload))
      .set('Content-Type', 'application/json')
  }
)

When(
  /^attaches an? (.+) payload where the ([a-zA-Z0-9, ]+) fields? (?:is|are)(\s+not)? a ([a-zA-Z]+)$/,
  function(payloadType, fields, invert, type) {
    this.requestPayload = getValidPayload(payloadType)
    const typeKey = type.toLowerCase()
    const invertKey = invert ? 'not' : 'is'
    const sampleValues = {
      string: { is: 'string', not: 500 },
    }
    const fieldsToModify = convertStringToArray(fields)
    fieldsToModify.forEach(field => {
      this.requestPayload[field] = sampleValues[typeKey][invertKey]
    })
    this.request
      .send(JSON.stringify(this.requestPayload))
      .set('Content-Type', 'application/json')
  }
)

When(
  /^attaches an? (.+) payload where the ([a-zA-Z0-9, ]+) fields? (?:is|are) exactly (.+)$/,
  function(payloadType, fields, value) {
    this.requestPayload = getValidPayload(payloadType)
    const fieldsToModify = convertStringToArray(fields)
    fieldsToModify.forEach(field => {
      this.requestPayload[field] = value
    })
    this.request
      .send(JSON.stringify(this.requestPayload))
      .set('Content-Type', 'application/json')
  }
)

When(/^attaches a valid (.+) payload$/, function(payloadType) {
  this.requestPayload = getValidPayload(payloadType)
  this.request
    .send(JSON.stringify(this.requestPayload))
    .set('Content-Type', 'application/json')
})

Then(
  /^our API should respond with a ([1-5]\d{2}) HTTP status code$/,
  function(statusCode) {
    assert.strict.equal(this.response.statusCode, +statusCode)
  }
)

Then(
  /^the payload of the response should be an? ([a-zA-Z0-9, ]+)$/,
  function(payloadType) {
    const contentType =
      this.response.headers['Content-Type'] ||
      this.response.headers['content-type']
    if (payloadType === 'JSON object') {
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response not of Content-Type application/json')
      }
      try {
        this.responsePayload = JSON.parse(this.response.text)
      } catch (e) {
        throw new Error('Response not a valid JSON object')
      }
    } else if (payloadType === 'string') {
      if (!contentType || !contentType.includes('text/plain')) {
        throw new Error('Response not of Content-Type text/plain')
      }
      this.responsePayload = this.response.text
      if (typeof this.responsePayload !== 'string') {
        throw new Error('Response not a string')
      }
    }
  }
)

Then(
  /^contains a message property which says (?:"|')(.*)(?:"|')$/,
  function(message) {
    assert.strict.equal(this.responsePayload.message, message)
  }
)

Then(
  /^the payload object should be added to the database, grouped under the "([a-zA-Z]+)" type$/,
  function(type, callback) {
    this.type = type
    client
      .get({
        index: env.ELASTICSEARCH_INDEX_TEST,
        type,
        id: this.responsePayload,
      })
      .then(result => {
        assert.deepStrictEqual(result._source, this.requestPayload)
        callback()
      })
      .catch(callback)
  }
)

Then(/^the newly-created user should be deleted$/, function(callback) {
  client
    .delete({
      index: env.ELASTICSEARCH_INDEX_TEST,
      type: this.type,
      id: this.responsePayload,
    })
    .then(result => {
      assert.strictEqual(result.result, 'deleted')
      callback()
    })
    .catch(callback())
})
