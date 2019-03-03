function checkEmptyPayload(req, res, next) {
  if (
    ['POST', 'PATCH', 'PUT'].includes(req.method) &&
    req.headers['content-length'] === '0'
  ) {
    res.status(400)
    res.set('Content-Type', 'application/json')
    res.json({
      message: 'Payload should not be empty',
    })
  }
  next()
}

function checkContentTypeIsSet(req, res, next) {
  if (
    req.headers['content-length'] &&
    req.headers['content-length'] !== '0' &&
    !req.headers['content-type']
  ) {
    res.status(400)
    res.set('Content-Type', 'application/json')
    res.json({
      message:
        'The "Content-Type" header must be set for requests with a non-empty payload',
    })
  }
  next()
}

function checkContentTypeIsJson(req, res, next) {
  if (!req.headers['content-type'].includes('application/json')) {
    res.status(415)
    res.set('Content-Type', 'application/json')
    res.json({
      message:
        'The "Content-Type" header must always be "application/json"',
    })
  }
  next()
}

export { checkContentTypeIsJson, checkContentTypeIsSet, checkEmptyPayload }
