function retrieve(req, db) {
  return db
    .get({
      index: process.env.ELASTICSEARCH_INDEX,
      type: 'user',
      id: req.params.userId,
      // _source_excludes: 'digest', TODO: update e2e tests
    })
    .then(res => res._source)
    .catch(err => {
      if (err.status === 404) {
        return Promise.reject(new Error('Not Found'))
      }
      return Promise.reject(new Error('Internal Server Error'))
    })
}

export default retrieve
