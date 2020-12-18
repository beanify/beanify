import NATS from 'nats'
import PINO from 'pino'
import AVIO from 'avvio'
import ERRI from './errio'
import ROTR from './router'
import PLGN from './plugin'
import HOOK from './hooks'

export interface BeanifyOptions {
  nats?: NATS.ClientOpts
  pino?: PINO.LoggerOptions
  errio?: ERRI.ErrioOptions
  router?: ROTR.RouterOptions
}

export type BeanifyDoneCallback = () => void

export interface BeanifyAfter<I> {
  (fn: (err: Error) => void): I
  (fn: (err: Error, done: BeanifyDoneCallback) => void): I
  (fn: (err: Error, context: I, done: BeanifyDoneCallback) => void): I
}

export interface BeanifyReady<I> {
  (): Promise<I>
  (fn: (err?: Error) => void): void
  (fn: (err: Error, done: BeanifyDoneCallback) => void): void
  (fn: (err: Error, context: I, done: BeanifyDoneCallback) => void): void
}

export interface BeanifyClose<I> {
  (fn: (err: Error) => void): void
  (fn: (err: Error, done: BeanifyDoneCallback) => void): void
  (fn: (err: Error, context: I, done: BeanifyDoneCallback) => void): void
}

export interface Beanify {
  $name: readonly string
  $options: BeanifyOptions
  $root: Beanify
  $version: string
  $avvio: AVIO.Avvio<Beanify>
  $log: PINO.Logger
  $errio: ERRI.Errio
  $nats: NATS.Client

  decorate(prop: string, value: any): Beanify
  hasDecorator(prop: string): boolean

  register: PLGN.BeanifyPlugin
  after: BeanifyAfter<Beanify>
  ready: BeanifyReady<Beanify>
  close: BeanifyClose<Beanify>

  // onClose hook
  addHook(name: 'onClose', fn: HOOK.OnCloseCallback): void
  addHook(name: 'onError', fn: HOOK.OnErrorCallback): void
  addHook(name: 'onRoute', fn: ROTR.OnRouteCallback<ROTR.Route>): void
  addHook(name: 'onBeforeInject', fn: ROTR.OnBeforeInject<ROTR.Inject>): void
  addHook(name: 'onAfterInject', fn: ROTR.onAfterInject<ROTR.Inject>): void
  addHook(name: 'onBeforeHandler', fn: ROTR.OnBeforeHandler<ROTR.Route>): void
  addHook(name: 'onAfterHandler', fn: ROTR.OnAfterHandler<ROTR.Route>): void

  route(opts: ROTR.Route, handler?: ROTR.RouteHandler<ROTR.Route>): Beanify
  inject(
    opts: ROTR.Inject,
    handler?: ROTR.InjectHandler<ROTR.Inject>
  ): Beanify | Promise<any>

  print(): void
}
