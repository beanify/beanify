# Installation

## install

```javascript
npm i beanify
```

## Options

* [nats](https://github.com/nats-io/nats.js#connect-options):config NATS Client Options (__json__:default __true__ [set by beanify])
* name:beanify ​cluster name
* log:beanify log options object
* [errio](https://github.com/programble/errio#options):errio Options 


__log.usePretty__:Pretty logging is disabled by default but you can enable it with usePretty option. Before you can use it you have install the pino-pretty package.
log.level

__log.level__:enum __['fatal' , 'error' , 'warn' ,'info' , 'debug' , 'trace' , 'silent']__

__log.useChild__:The default logger provide a function to create child loggers. This is used inside Beanify to create a logger context inside plugins.

## usage

```javascript

const Beanify = require('beanify')
const beanifyPlugin=require("beanify-plugin")

const beanify = new Beanify({
  nats:{},
  name:"is test",
  log:{
      level:'warn'
  }
})

beanify.register(beanifyPlugin((beanify,opts,done)=>{
    beanify.route({
        url:'math.add'
    },function ({body},res){
        res(null, body.a + body.b)
    })

    done()
})).ready((err)=>{
    beanify.inject({
        url:'math.add',
        body:{
            a:1,
            b:3
        }
    },function (err,res){
        beanify.$log.info(resp, 'Result')
    })
})

```