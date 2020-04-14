# Installation

## install

```javascript
npm i beanify
```

## Options

* name:beanify ​cluster name
* dev:```{mode:boolean,prefix:string}```
* [nats](https://github.com/nats-io/nats.js#connect-options):config NATS Client Options (__json__:default __true__ [set by beanify])
* [errio](https://github.com/programble/errio#options):errio Options 
* [pino](https://github.com/pinojs/pino):pino Options (__level__:default __warn__[set by beanify])


## usage

```javascript

const Beanify = require('beanify')
const beanifyPlugin=require("beanify-plugin")

const beanify = new Beanify({
  nats:{},
  name:"is test",
  pino:{
      level:'warn'
  }
  //prefix:'aaa'
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