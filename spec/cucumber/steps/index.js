import assert from 'assert'
import { config } from 'dotenv'
import superagent from 'superagent'
import { When, Then } from 'cucumber'

const env = config().parsed

When(/^the client creates a POST request to \/users$/, function() {
  // console.log(process.env)
  this.request = superagent(
    'POST',
    `${env.SERVER_HOSTNAME}:${env.SERVER_PORT}/users`
  )
})

When(/^attaches a generic empty payload$/, () => {
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

Then(/^our API should respond with a 400 HTTP status code$/, function() {
  assert.strict.equal(this.response.statusCode, 400)
})

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
  /^contains a message property which says "Payload should not be empty"$/,
  function() {
    assert.strict.equal(
      this.responsePayload.message,
      'Payload should not be empty'
    )
  }
)

When(/^attaches a generic non-JSON payload$/, function() {
  this.request.send(
    '<?xml version="1.0 encoding="UTF-8" ?><email>test@test.com</email>'
  )
  this.request.set('Content-Type', 'text/xml')
})

When(/^attaches a generic malformed payload$/, function() {
  this.request.send('{ "email": "test@test.com", name: }')
  this.request.set('Content-Type', 'application/json')
})

Then(/^our API should respond with a 415 HTTP status code$/, function() {
  assert.strict.equal(this.response.statusCode, 415)
})

Then(
  /^contains a message property which says 'The "Content-Type" header must always be "application\/json"'$/,
  function() {
    assert.strict.equal(
      this.responsePayload.message,
      'The "Content-Type" header must always be "application/json"'
    )
  }
)

Then(
  /^contains a message property which says "Payload should be in JSON format"$/,
  function() {
    assert.strict.equal(
      this.responsePayload.message,
      'Payload should be in JSON format'
    )
  }
)
