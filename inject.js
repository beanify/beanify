const { kInjectAttribute, kInjectContext, kInjectFlag } = require('./symbols')
const { InjectTimeoutError } = require('./errors')
const Merge = require('merge')

function Inject (opts) {
  for (const k in opts) {
    this[k] = opts[k]
  }

  this[kInjectAttribute] = this.attribute
  delete this.attribute

  this[kInjectContext] = this.context
  delete this.context
}

Inject.prototype.inject = function (opts, handler) {
  if (!this[kInjectFlag]) {
    return
  }
  const { addInject } = require('./queue')
  const { $beanify } = this
  const pLike = addInject.call($beanify, opts, handler, this)

  if (pLike instanceof Promise) {
    return pLike
  }

  return this
}

function requestSending (url, payload) {
  return new Promise((resolve, reject) => {
    const { $nats } = this
    $nats.publish(url, payload, e => {
      if (e) {
        reject(e)
      } else {
        resolve()
      }
    })
  })
}

function requestBlockSending (url, payload, opts) {
  return new Promise((resolve, reject) => {
    const { $nats } = this
    const inbox = $nats.request(url, payload, opts, reply => {
      resolve(reply)
    })
    $nats.timeout(inbox, opts.timeout, 1, () => {
      const e = new InjectTimeoutError(url)
      reject(e)
    })
  })
}

function injectRequestFlow (next) {
  const { url, body, $pubsub, $timeout, $attribute } = this
  const payload = {
    body,
    attrs: $attribute
  }

  this[kInjectFlag] = true
  let pLike = null
  if ($pubsub) {
    pLike = requestSending.call(this.$beanify, url, payload).then(async () => {
      return await this.handler(null)
    })
  } else {
    const reqOptions = {
      timeout: $timeout,
      max: 1
    }
    pLike = requestBlockSending
      .call(this.$beanify, url, payload, reqOptions)
      .then(async reply => {
        const nattrs = reply.attrs || {}
        const oattrs = this.$attribute
        const cattrs = Merge.recursive(oattrs, nattrs)

        this[kInjectAttribute] = cattrs
        if (reply.err) {
          const { $errio } = this.$beanify
          const e = $errio.fromObject(reply.err)
          return await this.handler(e)
        } else {
          return await this.handler(null, reply.data)
        }
      })
  }
  pLike
    .then(() => next())
    .catch(e => next(e))
    .finally(() => {
      this[kInjectFlag] = false
    })
}

module.exports = {
  Inject,
  injectRequestFlow
}
