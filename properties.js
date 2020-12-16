const {
  kBeanifyRoot,
  kBeanifyOptions,
  kBeanifyVersion,
  kBeanifyPlugins,
  kBeanifyAvvio,
  kBeanifyName,
  kInjectParent,
  kInjectBeanify,
  kInjectAttribute,
  kInjectContext,
  kRouteBeanify,
  kRouteAttribute,
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

module.exports = {
  initBeanifyProperties () {
    const props = {
      $root: kBeanifyRoot,
      $options: kBeanifyOptions,
      $version: kBeanifyVersion,
      $avvio: kBeanifyAvvio,
      $plugins: kBeanifyPlugins,
      $name: kBeanifyName
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

    Object.defineProperty(this, '$log', {
      get () {
        return this.$beanify.$log
      }
    })
  },
  initRouteProperties () {
    const props = {
      $beanify: kRouteBeanify,
      $attribute: kRouteAttribute
    }
    initProperties.call(this, props)

    Object.defineProperty(this, '$log', {
      get () {
        return this.$beanify.$log
      }
    })
  },
  initReplyProperties () {
    const props = {
      $sent: kReplySent,
      $data: kReplyData
    }
    initProperties.call(this, props)

    Object.defineProperty(this, '$log', {
      get () {
        return this.$beanify.$log
      }
    })
  }
}
