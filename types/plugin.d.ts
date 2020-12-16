import { Beanify } from './beanify'

export type PluginDoneCallback = (err?: Error) => void
export type PluginOptions = Record<string, any>
export type PluginCallback = (
  beanify: Beanify,
  opts: PluginOptions,
  done?: PluginDoneCallback
) => PromiseLike<void> | void

export interface BeanifyPlugin<
  Plugin extends PluginCallback = PluginCallback,
  Options extends PluginOptions = Record<string, any>
> {
  (plugin: Plugin, opts: Options): Beanify
}
