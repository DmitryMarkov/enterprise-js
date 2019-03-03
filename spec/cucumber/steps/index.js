import assert from 'assert'
import { config } from 'dotenv'
import superagent from 'superagent'
import { When, Then } from 'cucumber'

const env = config().parsed

When(
  /^the client creates a (GET|POST|PATCH|PUT|DELETE|OPTIONS|HEAD) request to ([/\w-:.]+)$/,
  function(method, path) {
    // console.log(process.env)
    this.request = superagent(
      method,
      `${env.SERVER_HOSTNAME}:${env.SERVER_PORT}${path}`
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
    const payload = {
      email: 'test@test.com',
      password: 'password',
    }
    const fieldsToDelete = missingFields
      .split(' , ')
      .map(string => string.trim())
      .filter(string => string !== '')
    fieldsToDelete.forEach(field => delete payload[field])
    this.request
      .send(JSON.stringify(payload))
      .set('Content-Type', 'application/json')
  }
)

When(
  /^attaches an? (.+) payload where the ([a-zA-Z0-9, ]+) fields? (?:is|are)(\s+not)? a ([a-zA-Z]+)$/,
  function(payloadType, fields, invert, type) {
    const payload = {
      email: 'test@test.com',
      password: 'password',
    }
    const typeKey = type.toLowerCase()
    const invertKey = invert ? 'not' : 'is'
    const sampleValues = {
      string: { is: 'string', not: 500 },
    }
    const fieldsToModify = fields
      .split(' , ')
      .map(string => string.trim())
      .filter(string => string !== '')
    fieldsToModify.forEach(field => {
      payload[field] = sampleValues[typeKey][invertKey]
    })
    this.request
      .send(JSON.stringify(payload))
      .set('Content-Type', 'application/json')
  }
)

When(
  /^attaches an? (.+) payload where the ([a-zA-Z0-9, ]+) fields? (?:is|are) exactly (.+)$/,
  function(payloadType, fields, value) {
    const payload = {
      email: 'test@test.com',
      password: 'password',
    }
    const fieldsToModify = fields
      .split(' , ')
      .map(string => string.trim())
      .filter(string => string !== '')
    fieldsToModify.forEach(field => {
      payload[field] = value
    })
    this.request
      .send(JSON.stringify(payload))
      .set('Content-Type', 'application/json')
  }
)

Then(
  /^our API should respond with a ([1-5]\d{2}) HTTP status code$/,
  function(statusCode) {
    assert.strict.equal(this.response.statusCode, +statusCode)
  }
)

Then(/^the payload of the response should be a JSON object$/, function() {
  const contentType =
    this.response.headers['Content-Type'] ||
    this.response.headers['content-type']
  if (!contentType || !contentType.includes('application/json')) {
    throw new Error('Response not of Content-Type application/josn')
  }
  try {
    this.responsePayload = JSON.parse(this.response.text)
  } catch (e) {
    throw new Error('Response not a valid JSON object.')
  }
})

Then(
  /^contains a message property which says (?:"|')(.*)(?:"|')$/,
  function(message) {
    assert.strict.equal(this.responsePayload.message, message)
  }
)
