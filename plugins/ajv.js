const AJV = require("ajv")
const errors=require("../errors")

module.exports = (beanify, opts, done) => {

  beanify.addHook('onBeforeHandler', (request) => {
    const schema = request.schema || {}

    const ajv = new AJV({
      removeAdditional: 'all'
    })

    if(typeof schema.body === 'object'){
      bodyCheck=ajv.compile(schema.body)
      if(bodyCheck(request.$req.body)===false){
        const err = new errors.SchemaError(ajv.errorsText(bodyCheck.errors))
        throw err
      }
    }
  })

  beanify.addHook('onAfterHandler',(request)=>{
    const schema = request.schema || {}

    const ajv = new AJV({
      removeAdditional: 'all'
    })

    if(typeof schema.response === 'object'){
      responseCheck=ajv.compile(schema.response)
      if(responseCheck(request.$res.res)===false){
        const err = new errors.SchemaError(ajv.errorsText(responseCheck.errors))
        throw err
      }
    }
  })


  done()
}