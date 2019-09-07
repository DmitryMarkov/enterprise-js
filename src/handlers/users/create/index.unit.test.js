import assert from 'assert'
import { stub } from 'sinon'
import ValidationError from '../../../validators/errors/validationError'

const createStubs = {
  success: stub().resolves({ _id: 'foo' }),
  validationError: stub().rejects(new ValidationError()),
  otherError: stub().rejects(new Error()),
}

describe('user create handler', function() {
  it('should do nothing', function() {
    // do nothingt
    assert(createStubs)
  })
})
