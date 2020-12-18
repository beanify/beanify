import { Beanify } from './beanify'

export type PluginDoneCallback = (err?: Error) => void
export interface PluginOptions {
  name?: string
  prefix?: string
  beanify?: string
}
export type PluginCallback = (
  beanify: Beanify,
  opts: PluginOptions,
  done?: PluginDoneCallback
) => PromiseLike<void> | void

export interface BeanifyPlugin<
  Plugin extends PluginCallback = PluginCallback,
  Options extends PluginOptions = PluginOptions
> {
  (plugin: Plugin, opts: Options): Beanify
}
