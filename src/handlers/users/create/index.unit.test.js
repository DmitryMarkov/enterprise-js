import assert from 'assert'
import { stub } from 'sinon'
import ValidationError from '../../../validators/errors/validationError'
import createUser from './index'

const createStubs = {
  success: stub().resolves({ _id: 'foo' }),
  validationError: stub().rejects(new ValidationError()),
  otherError: stub().rejects(new Error()),
}

describe('user create handler', function() {
  beforeEach(function() {
    // const create = createStubs.success()
    // const req = {}
    // const res = {}
    // const db = () => ({})
    // return createUser(
    //   req,
    //   res,
    //   db,
    //   create,
    //   createStubs.ValidationError
    // )
  })
  it('should do nothing', function() {
    // do nothing, to do
    assert(createStubs)
  })
})
