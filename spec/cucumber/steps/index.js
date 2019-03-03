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
