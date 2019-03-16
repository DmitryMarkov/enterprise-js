import ValidationError from '../../validators/errors/validationError'
import create from '../../engines/users/create'

function createUser(req, res, db) {
  create(req, db)
    .then(result => {
      res.status(201)
      res.set('Content-Type', 'text/plain')
      res.send(result)
      return result
    })
    .catch(err => {
      if (err instanceof ValidationError) {
        res.status(400)
        res.set('Content-Type', 'application/json')
        res.json({
          message: err.message,
        })
        return err
      }
      res.status(500)
      res.set('Content-Type', 'application/json')
      res.json({
        message: 'Internal Server Error',
        error: err,
      })
      return err
    })
}

export default createUser
