import assert from 'assert'
import { config } from 'dotenv'
import superagent from 'superagent'
import { When, Then } from 'cucumber'

const env = config()

When('the client creates a POST request to /users', function () {
  console.log(env)
  this.request = superagent('POST', `localhost:8080/users`)
})

When('attaches a generic empty payload', () => {
  return undefined
})

When('sends the request', function (cb) {
  this.request
    .then((response) => {
      this.response = response.res
      cb()
    })
    .catch((err) => {
      this.response = err.response
      cb()
    })
})

Then('our API should respond with a 400 HTTP status code', function () {
  assert.strict.equal(this.response.statusCode, 400)
})

Then('the payload of the response should be a JSON object', function () {
  const contentType = this.response.headers['Content-Type'] || this.response.headers['content-type']
  if (!contentType || !contentType.includes('application/json')) {
    throw new Error('Response not of Content-Type application/josn')
  }
  try {
    this.responsePayload = JSON.parse(this.response.text)
  } catch (e) {
    throw new Error('Response not a valid JSON object.')
  }
})

Then('contains a message property which says "Payload should not be empty"', function () {
  assert.strict.equal(this.responsePayload.message, 'Payload should not be empty')
})
