import { Beanify, BeanifyOptions } from './types/beanify'

declare function factory (options: BeanifyOptions): Beanify

export = factory

export {
  BeanifyOptions,
  BeanifyDoneCallback,
  BeanifyAfter,
  BeanifyReady,
  BeanifyClose,
  Beanify
} from './types/beanify'

export { ErrioOptions, Errio } from './types/errio'

export {
  HookDoneCallback,
  OnCloseCallback,
  OnErrorCallback
} from './types/hooks'

export {
  PluginDoneCallback,
  PluginOptions,
  PluginCallback,
  BeanifyPlugin
} from './types/plugin'

export {
  RouterOptions,
  Request,
  Reply,
  InjectHandler,
  OnRouteCallback,
  OnBeforeInject,
  onAfterInject,
  RouteHandler,
  OnBeforeHandler,
  OnAfterHandler,
  Route,
  Inject
} from './types/router'
