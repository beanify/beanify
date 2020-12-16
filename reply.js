const {
  kReplyRoute,
  kReplySent,
  kReplyTo,
  kReplyData,
  kReplyFlag
} = require('./symbols')

function replySending (url, payload) {
  const {
    $beanify: { $nats }
  } = this[kReplyRoute]
  $nats.publish(url, payload)
}

function Reply () {
  this[kReplySent] = false
}

Reply.prototype.error = function (err) {
  if (this[kReplySent]) {
    return
  }

  this[kReplySent] = true
  const route = this[kReplyRoute]
  const url = this[kReplyTo]
  const {
    $beanify: { $errio },
    $pubsub
  } = route

  if ($pubsub) {
    return
  }

  const errMsg = $errio.toObject(err)
  const payload = {
    attrs: route.$attribute,
    err: errMsg
  }
  replySending.call(this, url, payload)
}

Reply.prototype.send = function (data) {
  if (!this[kReplyFlag]) {
    return
  }

  if (this.$data) {
    return
  }

  this[kReplyData] = data
}

module.exports = {
  Reply,
  replySending
}
