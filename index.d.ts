/// <reference types="node" />

import NATS from "nats"
import AVVIO from "avvio"
import PINO from "pino"
import BeanifyPlugin from "beanify-plugin"
import AJV from 'ajv'
import { EventEmitter } from "events"

declare namespace Beanify {

    type LogLevel = 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace' | 'silent'

    interface ErrioOptions {
        recursives?: boolean,
        inherited?: boolean,
        stack?: boolean,
        private?: boolean,
        exclude?: Array<any>,
        include?: Array<any>
    }

    interface ErrioObject {
        setDefaults(options: ErrioOptions): void
        register(constructor: FunctionConstructor, options?: any): void
        registerAll(constructors: Array<FunctionConstructor>, options?: any): void
        registerObject(constructors: Function, options?: any): void
        toObject(error: any, callOptions?: any): Object
        fromObject(object: Object, callOptions?: any): Error
        stringify(error, callOptions?: any): string
        parse(string: String, callOptions?: any): Error
    }

    interface Options {
        nats: NATS.ClientOpts
        pino?: PINO.LoggerOptions,
        errio?: ErrioOptions,
        router?: { prefix?: string }
        docs?: { dir?: string, enable?: boolean }
    }

    interface DoneCallback {
        (
            error?: Error | null | undefined,
            success?: any
        ): void
    }

    type HookType = 'onClose'
        | 'onRoute'
        | 'onBeforeInject'
        | 'onInject'
        | 'onAfterInject'
        | 'onBeforeHandler'
        | 'onHandler'
        | 'onAfterHandler'
        | 'onError'
}

declare class Beanify {
    constructor(options: Beanify.Options)

    decorate(
        name: string,
        decoration: any,
        dependencies?: Array<string>
    ): Beanify
    hasDecorator(name: string): Boolean

    register(
        plugin: BeanifyPlugin.BeanifyFunction,
        opts?: object
    ): Beanify

    ready(): Promise<Beanify>
    ready(cb: (err: Error) => void): void
    ready(cb: (err: Error, done: Function) => void): void
    ready(cb: (err: Error, context: Beanify, done: Function) => void): void

    close(cb: (err: Error) => void): void
    close(cb: (err: Error, done: Function) => void): void
    close(cb: (err: Error, context: Beanify, done: Function) => void): void

    onClose(cb: (context: Beanify, done: Function) => void): Beanify

    after(cb: (err: Error) => void): Beanify
    after(cb: (err: Error, done: Function) => void): Beanify
    after(db: (err: Error, context: Beanify, done: Function) => void): Beanify

    $root: Beanify
    $options: Beanify.Options
    $avvio: AVVIO.Avvio<Beanify>
    $plugins: Array<string>

    //errio
    $errio: ErrioObject

    //logger
    $log: PINO.Logger

    //nats
    $nats: NATS.Client

    //router
    route(
        opts: {
            url: string,
            $queue?: string,
            $pubsub?: boolean
            $timeout?: number
            $useGlobalPrefix?: boolean

            schema?: {
                body?: object,
                response?: object
            }

            docs?: {
                name?: string,
                desc?: string
            }

            onRoute?: (route: object) => void

            onBeforeInject?: (inject: object) => void
            onInject?: (inject: object) => void
            onAfterInject?: (inject: object) => void

            onBeforeHandler?: (request: object) => void
            onHandler?: (request: object) => void
            onAfterHandler?: (request: object) => void

            onError?: (err: Error) => void
        },
        cb: (req: { body: object }, res: (err: Error, res: any) => void) => void
    ): Beanify
    route(
        opts: {
            url: string,
            handler: (req: { body: object }, res: (err: Error, res: any) => void) => void
            $queue?: string,
            $pubsub?: boolean
            $timeout?: number
            $useGlobalPrefix?: boolean

            schema?: {
                body?: object,
                response?: object
            }

            docs?: {
                name?: string,
                desc?: string
            }

            onRoute?: (route: object) => void

            onBeforeInject?: (inject: object) => void
            onInject?: (inject: object) => void
            onAfterInject?: (inject: object) => void

            onBeforeHandler?: (request: object) => void
            onHandler?: (request: object) => void
            onAfterHandler?: (request: object) => void

            onError?: (err: Error) => void
        }
    ): Beanify
    route(
        opts: {
            url: string,
            $queue?: string,
            $pubsub?: boolean
            $timeout?: number
            $useGlobalPrefix?: boolean

            schema?: {
                body?: object,
                response?: object
            }

            docs?: {
                name?: string,
                desc?: string
            }

            onRoute?: (route: object) => void

            onBeforeInject?: (inject: object) => void
            onInject?: (inject: object) => void
            onAfterInject?: (inject: object) => void

            onBeforeHandler?: (request: object) => void
            onHandler?: (request: object) => void
            onAfterHandler?: (request: object) => void

            onError?: (err: Error) => void
        },
        cb: (req: { body: object }) => Promise
    ): Beanify
    route(
        opts: {
            url: string,
            handler: (req: { body: object }) => Promise
            $queue?: string,
            $pubsub?: boolean
            $timeout?: number
            $useGlobalPrefix?: boolean

            schema?: {
                body?: object,
                response?: object
            }

            docs?: {
                name?: string,
                desc?: string
            }

            onRoute?: (route: object) => void

            onBeforeInject?: (inject: object) => void
            onInject?: (inject: object) => void
            onAfterInject?: (inject: object) => void

            onBeforeHandler?: (request: object) => void
            onHandler?: (request: object) => void
            onAfterHandler?: (request: object) => void

            onError?: (err: Error) => void
        }
    ): Beanify

    inject(
        opts: {
            url: string,
            body: object | string | null
            $pubsub?: boolean
            $timeout?: number
            $useGlobalPrefix?: boolean
        },
        cb: (err: Error, res: object | string | null) => void
    ): Beanify

    inject(
        opts: {
            url: string,
            body: object | string | null
            $pubsub?: boolean
            $timeout?: number
            $useGlobalPrefix?: boolean
        }
    ): Promise


    addHook(hookName: HookType, cb: Function)
    // inject: Beanify.RouterInject
}

export = Beanify