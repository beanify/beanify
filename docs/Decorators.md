<h1 align="center">Beanify</h1>

## Decorators

The decorators API can be used to attach any type of property to the core objects, e.g. functions, plain objects, or native types.

This API is a _synchronous_ API. Attempting to define a decoration asynchronously could result in the Beanify instance booting prior to the decoration completing its initialization. To avoid this issue, and register an asynchronous decoration, the register API, in combination with [plugin](./Plugins.md#Usage), must be used instead.

## Usage

### `decorate(name, value)`

This method is used to customize the beanify instance.

For example, to attach a new method to the beanify instance:

```javascript
beanify.decorate('utility', function () {
  // Something very useful
})
```

As mentioned above, non-function values can be attached:

```javascript
beanify.decorate('conf', {
  db: 'some.db'
})
```

To access decorated properties, simply use the name provided to the decoration API:

```javascript
beanify.utility()

console.log(beanify.conf.db)
```

### `hasDecorator(name)`

Used to check for the existence of a server instance decoration:

```javascript
beanify.hasDecorator('utility')
```
