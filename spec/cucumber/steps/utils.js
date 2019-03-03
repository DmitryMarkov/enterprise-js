function getValidPayload(type) {
  const lowercaseType = type.toLowerCase()
  switch (lowercaseType) {
    case 'create user':
      return {
        email: 'test@test.com',
        password: 'password',
      }
    default:
      return undefined
  }
}

function convertStringToArray(string) {
  return string
    .split(' , ')
    .map(string => string.trim())
    .filter(string => string !== '')
}

export { getValidPayload, convertStringToArray }
