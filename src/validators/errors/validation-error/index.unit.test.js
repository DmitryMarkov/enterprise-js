import assert from 'assert'
import ValidationError from './index'

describe('ValidationError', function() {
  it('should be a subclass of Error', function() {
    const validationError = new ValidationError()
    assert.strictEqual(validationError instanceof Error, true)
  })
  describe('constructor', function() {
    it('should make the constructor parameter accessible via the `message` property of the instance', function() {
      const TEST_ERROR = 'TEST_ERROR'
      const validationError = new ValidationError(TEST_ERROR)
      assert.strictEqual(validationError.message, TEST_ERROR)
    })
  })
})
