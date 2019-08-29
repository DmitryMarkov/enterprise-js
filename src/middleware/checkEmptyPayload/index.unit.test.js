import assert from 'assert'
import deepClone from 'lodash.clonedeep'
import deepEqual from 'lodash.isequal'
import { spy, stub } from 'sinon'
import checkEmptyPayload from '.'

describe('checkEmptyPayload', function() {
  let req
  let res
  let next

  describe('When req.method is not one of POST, PATCH or PUT', function() {
    let clonedRes

    beforeEach(function() {
      req = { method: 'GET' }
      res = {}
      next = spy()
      clonedRes = deepClone(res)

      checkEmptyPayload(req, res, next)
    })

    it('should not modify res', function() {
      assert(deepEqual(res, clonedRes))
    })

    it('should call next() once', function() {
      assert(next.calledOnce)
    })
  })
  ;['POST', 'PATCH', 'PUT'].forEach(method => {
    describe(`When req.method is ${method} and the content-length header is not "0"`, function() {
      let clonedRes

      beforeEach(function() {
        req = {
          method,
          headers: {
            'content-length': '1',
          },
        }
        res = {}
        next = spy()
        clonedRes = deepClone(res)
        checkEmptyPayload(req, res, next)
      })

      it('should not modify res', function() {
        assert(deepEqual(res, clonedRes))
      })

      it('should call next()', function() {
        assert(next.calledOnce)
      })
    })
    xdescribe(`When req.method is ${method} and the content-length header is "0"`, function() {
      let resJsonReturnValue
      let returnedValue

      beforeEach(function() {
        req = {
          method,
          headers: {
            'content-length': '0',
          },
        }
        resJsonReturnValue = {}
        res = {
          status: spy(),
          set: spy(),
          json: stub().returns(resJsonReturnValue),
        }
        next = spy()

        checkEmptyPayload(req, res, next)
        returnedValue = checkEmptyPayload(req, res, next)
      })

      it('should not call next()', function() {
        assert(next.notCalled)
      })

      it('should return whatever res.json() returns', function() {
        assert.strictEqual(returnedValue, resJsonReturnValue)
      })

      describe('should call res.status()', function() {
        it('once', function() {
          assert(res.status.calledOnce)
        })
        it('with the argument 400', function() {
          assert(res.status.calledWithExactly(400))
        })
      })

      describe('should call res.set()', function() {
        it('once', function() {
          assert(res.set.calledOnce)
        })
        it('with the arguments "Content-Type" and "application/json"', function() {
          assert(
            res.set.calledWithExactly('Content-Type', 'application/json')
          )
        })
      })

      describe('should call res.json()', function() {
        it('once', function() {
          assert(res.json.calledOnce)
        })
        it('with the correct error object', function() {
          assert(
            res.json.calledWithExactly({
              message: 'Payload should not be empty',
            })
          )
        })
      })
    })
    describe(`When req.method is ${method} and the content-length header is 0`, function() {
      const req = {
        method,
        headers: {
          'content-length': '0',
        },
      }
      const res = {
        status: spy(),
        set: spy(),
        json: spy(),
      }
      const next = spy()

      checkEmptyPayload(req, res, next)

      it('should set res with a 400 status code', function() {
        assert(res.status.calledOnce)
        assert(res.status.calledWithExactly(400))
      })

      it('should set res with an application/json content-type header', function() {
        assert(res.set.calledOnce)
        assert(
          res.set.calledWithExactly('Content-Type', 'application/json')
        )
      })

      it('should set res.json with error code', function() {
        assert(res.json.calledOnce)
        assert(
          res.json.calledWithExactly({
            message: 'Payload should not be empty',
          })
        )
      })
    })
  })
})
