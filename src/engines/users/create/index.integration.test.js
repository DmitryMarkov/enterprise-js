import assert from 'assert'
import elasticsearch from 'elasticsearch'
import ValidationError from '../../../validators/errors/validationError'
import createUserValidator from '../../../validators/users/create'
import create from '.'

const db = new elasticsearch.Client({
  host: `${process.env.ELASTICSEARCH_HOSTNAME}:${process.env.ELASTICSEARCH_PORT}`,
})

describe('User Create Engine', function() {
  describe('When invoked with invalid req', function() {
    it('should return promise that rejects with an instance of ValidationError', function() {
      const req = {}
      create(req, db, createUserValidator, ValidationError).catch(err =>
        assert(err instanceof ValidationError)
      )
    })
  })
  describe('When invoked with valid req', function() {
    it('should return a success object containing the user ID', function() {
      const req = {
        body: {
          email: 'e@ma.il',
          password: 'password',
          profile: {},
        },
      }
      create(req, db, createUserValidator, ValidationError).then(result => {
        assert.strictEqual(result.result, 'created')
        assert.strictEqual(typeof result._id, 'string')
      })
    })
  })
})
