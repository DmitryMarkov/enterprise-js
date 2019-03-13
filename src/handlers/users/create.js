import ValidationError from '../../validators/errors/validationError'
import validate from '../../validators/users/create'

function createUser(req, res, db) {
  const validationResults = validate(req)
  if (validationResults instanceof ValidationError) {
    res.status(400)
    res.set('Content-Type', 'application/json')
    return res.json({
      message: validationResults.message,
    })
  }
  db.index({
    index: process.env.ELASTICSEARCH_INDEX,
    type: 'user',
    body: req.body,
  }).then(
    function(result) {
      res.status(201)
      res.set('Content-Type', 'text/plain')
      res.send(result._id)
    },
    function(err) {
      res.status(500)
      res.set('Content-Type', 'application/json')
      res.json({
        message: 'Internal Server Error',
        error: err,
      })
    }
  )
}

export default createUser
