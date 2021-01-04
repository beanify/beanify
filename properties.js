const {
  kBeanifyRoot,
  kBeanifyOptions,
  kBeanifyVersion,
  kBeanifyAvvio,
  kBeanifyErrio,
  kBeanifyPino,
  kBeanifyNats,
  kBeanifyName,
  kInjectParent,
  kInjectBeanify,
  kInjectAttribute,
  kInjectContext,
  kRouteBeanify,
  kRouteAttribute,
  kRouteParent,
  kReplySent,
  kReplyData
} = require('./symbols')

function initProperties (props) {
  for (const pn in props) {
    Object.defineProperty(this, pn, {
      get () {
        return this[props[pn]]
      }
    })
  }
}

function initLogProperty () {
  Object.defineProperty(this, '$log', {
    get () {
      return this.$beanify.$log
    }
  })
}

module.exports = {
  initBeanifyProperties () {
    const props = {
      $name: kBeanifyName,
      $options: kBeanifyOptions,
      $root: kBeanifyRoot,
      $version: kBeanifyVersion,
      $avvio: kBeanifyAvvio,
      $log: kBeanifyPino,
      $errio: kBeanifyErrio,
      $nats: kBeanifyNats
    }
    initProperties.call(this, props)
  },
  initInjectProperties () {
    const props = {
      $parent: kInjectParent,
      $beanify: kInjectBeanify,
      $attribute: kInjectAttribute,
      $context: kInjectContext
    }
    initProperties.call(this, props)
    initLogProperty.call(this)
  },
  initRouteProperties () {
    const props = {
      $parent: kRouteParent,
      $beanify: kRouteBeanify,
      $attribute: kRouteAttribute
    }
    initProperties.call(this, props)
    initLogProperty.call(this)
  },
  initReplyProperties () {
    const props = {
      $sent: kReplySent,
      $data: kReplyData
    }
    initProperties.call(this, props)
    initLogProperty.call(this)
  }
}
