const defaultOptions=require("../../default-options")
const tap=require("tap")

tap.test("defaultOptions test",(t)=>{
    t.plan(1)

    let defaultOpts={
        name:"test"
    }

    t.strictSame(defaultOptions(defaultOpts),{
        nats:{
            json:true
        },
        log:{
            usePretty:false,
            level:'warn',
            useChild:false
        },
        name:"test",
        errio:{
            recursive:true,
            inherited:true,
            stack:true,
            private:false,
            exclude:[],
            include:[]
        }
    },"check defaultOptions object",{defaultOpts})
})

tap.test("defaultOptions test with custom setting",(t)=>{
    t.plan(1)

    let defaultOpts={
        name:"test",
        nats:{
            url:'nats://localhost:4222'
        },
        log:{
            useChild:true,
            level:'info'
        },
        errio:{
            stack:false
        }
    }

    t.strictSame(defaultOptions(defaultOpts),{
        nats:{
            json:true,
            url:'nats://localhost:4222'
        },
        log:{
            usePretty:false,
            level:'info',
            useChild:true
        },
        name:"test",
        errio:{
            recursive:true,
            inherited:true,
            stack:false,
            private:false,
            exclude:[],
            include:[]
        }
    },"check customOptions object ",{defaultOpts})
})
