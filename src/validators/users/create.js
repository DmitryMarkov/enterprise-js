import Ajv from 'ajv'
import profileSchema from '../../schema/users/profile.json'
import createUserSchema from '../../schema/users/create.json'
import generateValidationErrorMessage from '../errors/messages'
import ValidationError from '../errors/validation-error'

function validate(req) {
  const ajvValidate = new Ajv({ allErrors: true })
    .addFormat('email', /^[\w.+]+@\w+\.\w+$/)
    .addSchema([profileSchema, createUserSchema])
    .compile(createUserSchema)

  const valid = ajvValidate(req.body)
  if (!valid) {
    return new ValidationError(
      generateValidationErrorMessage(ajvValidate.errors)
    )
  }
  return true
}

export default validate
