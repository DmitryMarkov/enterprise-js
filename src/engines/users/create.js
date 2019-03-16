import ValidationError from '../../validators/errors/validationError'
import validate from '../../validators/users/create'

function create(req, db) {
  const validationResults = validate(req)

  if (validationResults instanceof ValidationError) {
    return Promise.reject(validationResults)
  }
  return db
    .index({
      index: process.env.ELASTICSEARCH_INDEX,
      type: 'user',
      body: req.body,
    })
    .then(res => res._id)
    .catch(() => Promise.reject(new Error('Internal Server Error')))
}

export default create
