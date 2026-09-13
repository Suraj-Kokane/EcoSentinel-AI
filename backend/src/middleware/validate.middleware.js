// Zod validation middleware. Usage:
//   validate({ body: createAlertSchema, query: listQuerySchema, params: idSchema })
export function validate(schemas) {
  return (req, res, next) => {
    try {
      if (schemas.body) req.body = schemas.body.parse(req.body)
      if (schemas.query) {
        const parsed = schemas.query.parse(req.query)
        req.query = parsed
      }
      if (schemas.params) {
        const parsed = schemas.params.parse(req.params)
        req.params = parsed
      }
      next()
    } catch (err) {
      next(err)
    }
  }
}

export default validate