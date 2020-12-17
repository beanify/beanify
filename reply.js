const {
  kReplyRoute,
  kReplySent,
  kReplyTo,
  kReplyData,
  kReplyFlag
} = require('./symbols')

function replySending (payload) {
  const url = this[kReplyTo]
  const {
    $beanify: { $nats },
    $pubsub
  } = this[kReplyRoute]

  if ($pubsub || !url) {
    return
  }

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
  const {
    $beanify: { $errio }
  } = route

  const errMsg = $errio.toObject(err)
  const payload = {
    attrs: route.$attribute,
    err: errMsg
  }
  replySending.call(this, payload)
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
