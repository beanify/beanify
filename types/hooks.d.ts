import { Beanify } from './beanify'

export type HookDoneCallback = (err?: Error) => void

export type OnCloseCallback = (this: Beanify) => Promise<void> | void

export type OnErrorCallback = (
  this: Beanify,
  err: Error
) => Promise<void> | void
