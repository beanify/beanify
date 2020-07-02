
const Beanify = require('./index')
const beanifyPlugin = require('beanify-plugin')

const beanify = new Beanify({
  pino: {
    prettyPrint: true
  },
  docs:{
    dir:'ccc',
    // enable:false
  }
})

beanify.register(beanifyPlugin((beanify, opts, done) => {

  beanify.route({
    docs:{
      name:'XXXXXX接口',
      description:'hjakhsjdhajkshd'
    },  
    url: '123123',
    onBeforeHandler(request) {
      this.$log.debug('onBeforeHandler')
    },
    onHandler(request) {
      this.$log.debug('onHandler')
    },
    onAfterHandler(request) {
      this.$log.debug('onAfterHandler')
    },
    onError(err) {
      this.$log.debug('route onError')
    },
  }, async ({ body }) => {
    // console.log(body)
    return { "data": 12345 }
  })
  done()
}, {
  prefix: 'test0',
  name: 'test0'
}))

beanify.register(beanifyPlugin((beanify,opts,done)=>{
  beanify.route({
    url:'dddddd',
    schema:{
      body:{
        type: 'object',
        properties: {
          aaa:{
            type:'string'
          },
          // bbb:{
          //   type:'string'
          // }
        }
      },
      response:{
        type: 'object',
        properties: {
          test:{
            type:'string'
          },
          bbb:{
            type:'string'
          }
        },
        required:['bbb']
      }
    },
    docs:{
      name:'test api'
    }
  },({body},callback)=>{
    callback(null,{
      ...body,
      test:'6666666',
      bbb:'789789'
    })
  })
  done()
},{
  prefix:'test1',
  name:'test1'
}))


beanify.ready(function (err) {
  if (!err) {
    this.$log.debug('beanify ready....')

    beanify.inject({
      url: 'test0.123123',
      body: {
        aaa:'9999999'
      },
      onBeforeInject(inject) {
        this.$log.debug('onBeforeInject')
      },
      onInject(inject) {
        this.$log.debug('onInject')
      },
      onAfterInject(inject) {
        this.$log.debug('onAfterInject')
        this.$log.info(inject.url)
        this.$log.info(inject.$trace)
      },
      onError(err) {
        this.$log.debug('inject onError')
      }
      // $pubsub:true
    }, function (err, res) {
      this.inject({
        url: 'test1.dddddd',
        body: {
          aaa:'88888888',
          bbb:'44444444'
        },
      },function(err,res){
        console.log(
          err,res
        )
      })
    })
  } else {
    this.$log.error(err)
  }

})