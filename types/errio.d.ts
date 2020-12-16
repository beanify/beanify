export interface ErrioOptions {
  recursive?: boolean
  inherited?: boolean
  stack?: boolean
  private?: boolean
  exclude?: string[]
  include?: string[]
}

export interface Errio {
  setDefaults(options: ErrioOptions): void
  register(constructor: FunctionConstructor, options?: any): void
  registerAll(constructors: FunctionConstructor[], options?: any): void
  // registerObject(constructors: Function, options?: any): void
  toObject(error: Error, callOptions?: any): Record<string, any>
  fromObject(object: Record<string, any>, callOptions?: any): Error
  stringify(error: Error, callOptions?: any): string
  parse(string: string, callOptions?: any): Error
}
