import { Beanify } from './beanify'
import PINO from 'pino'

export interface RouterOptions {
  prefix?: string
}

export interface Request {
  url: string
  body?: any
}

export interface Reply {
  // methods
  error(err: Error): void
  send(data: any): void

  // properties
  $data: Readonly<any>
  $sent: Readonly<boolean>
  $log: Readonly<PINO.Logger>
}

export type InjectHandler<S> = (
  this: S,
  err?: Error,
  data?: Record<string, unknown>
) => Promise<void> | void

export type OnRouteCallback<S> = (
  this: Beanify,
  route: S
) => Promise<void> | void

export type OnBeforeInject<I> = (this: I) => Promise<void> | void

export type onAfterInject<I> = (this: I) => Promise<void> | void

export type RouteHandler<S> = (
  this: S,
  req: Request,
  rep?: Reply
) => Promise<any> | void

export type OnBeforeHandler<R> = (
  this: R,
  req: Request,
  rep: Reply
) => Promise<void> | void

export type OnAfterHandler<R> = (
  this: R,
  req: Request,
  rep: Reply
) => Promise<void> | void

export interface Route {
  // options
  url: string
  attribute?: Record<string, unknown>
  $queue?: string //  $pubsub is invalid when $queue is not empty
  $pubsub?: boolean //  $pubsub needs to return data if it is true
  $timeout?: number
  $usePrefix?: boolean //  Add route prefix automatically ?
  handler?: RouteHandler<Route>

  // properties
  $beanify: Readonly<Beanify>
  $attribute: Readonly<Record<string, unknown>>
  $log: Readonly<PINO.Logger>

  // hooks
  onBeforeHandler?: OnBeforeHandler<Route>
  onAfterHandler?: OnAfterHandler<Route>
}

export interface Inject {
  // options
  url: string
  body?: any
  attribute?: Record<string, unknown>
  context?: Record<string, unknown>
  $pubsub?: boolean
  $timeout?: number
  $usePrefix?: boolean //  Add route prefix automatically ?
  handler?: InjectHandler<Inject>

  // properties
  $parent: Readonly<Inject | undefined>
  $beanify: Readonly<Beanify>
  $attribute: Readonly<Record<string, unknown>>
  $context: Readonly<Record<string, unknown>>
  $log: Readonly<PINO.Logger>

  // hooks
  onBeforeInject?: OnBeforeInject<Inject>
  onAfterInject?: onAfterInject<Inject>

  // methods
  inject(
    opts: Inject,
    handler?: InjectHandler<Inject>
  ): Inject | Promise<Record<string, unknown>>
}
