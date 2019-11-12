const NUID = require("nuid")

class Util {

    static generateRandomId() {
        return NUID.next()
    }

    // static nowTime() {
    //     const ts = process.hrtime()
    //     return ts[0] * 1e3 + ts[1] / 1e6
    // }

    // static formatSpecialProp(obj) {
    //     if (obj === null) {
    //         return obj
    //     }

    //     const o = {}

    //     for (const key in obj) {
    //         if(key.startsWith('$')&&!(obj[key] instanceof RegExp)&&!(typeof obj[key]==='function')){
    //             o[key]=obj[key] 
    //         }
    //     }

    //     return o;
    // }

    static checkNoError(chain, err) {
        if (err) {
            chain.RunHook('onError', { err }, () => { })
            return false;
        } else {
            return true;
        }
    }

    static RunFuncs(funcs,args,done){
        let i = 0;

        let next = (err) => {
            if (err || i === funcs.length) {
                done(err)
                return
            }

            try {
                const result = funcs[i++](args, next);

                if (result && typeof result.then === 'function') {
                    result.then(resolve, reject)
                }
            } catch (e) {
                done(e)
            }
        }

        let resolve = () => {
            next()
        }

        let reject = (err) => {
            done(err)
        }

        next()
    }


    // static IteratorFuncs(funcs,args,done){
    //     let i = 0;

    //     let doNext=(state)=>{
    //         if(i===funcs.length){
    //             done(state)
    //             return;
    //         }
            
    //         funcs[i++](state,doNext)
    //     }

    //     doNext(args)
    // }

}

module.exports = Util