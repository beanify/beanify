const {
  kReplyRoute,
  kReplySent,
  kReplyTo,
  kReplyData,
  kReplyFlag
} = require('./symbols')

function replySending (payload) {
  if (this[kReplySent]) {
    return
  }

  this[kReplySent] = true
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
  const {
    $attribute,
    $beanify: { $errio }
  } = this[kReplyRoute]

  const errMsg = $errio.toObject(err)
  const payload = {
    attrs: $attribute,
    err: errMsg
  }

  replySending.call(this, payload)
}

Reply.prototype.send = function (data) {
  if (!this[kReplyFlag]) {
    return
  }

  this[kReplyData] = data
}

module.exports = {
  Reply,
  replySending
}
