<h1 align="center">Beanify</h1>

## Plugins

Beanify allows the user to extend its functionalities with plugins. A plugin can be a set of routes, a server decorator or whatever. The API that you will need to use one or more plugins, is register.

when you set plugin `name`, register creates a new scope, this means that if you do some changes to the Beanify instance (via decorate), this change will not be reflected to the current context ancestors, but only to its sons. This feature allows us to achieve plugin encapsulation and inheritance, in this way we create a direct acyclic graph (DAG) and we will not have issues caused by cross dependencies.

You already see in the [getting started](./Getting-Started.md#your-first-plugin) section how using this API is pretty straightforward.

```javascript
beanify.register(plugin, options)
```

## Plugin Options

- **name**: Beanify uses this option to print scope graph.when you set value, register creates a new scope
- **prefix**: the new scope `route` prefix.The prefix of the parent will be inherited
- **beanify**: Used to detect the current beanify version

## Usage

```javascript
beanify.register(function (nIns, opts, done) {
  done()
})
```

with async-await:

```javascript
beanify.register(async function (oIns, opts) {})
```

## Example

Create new scope example

```javascript
beanify.register(
  function (nIns, opts, done) {
    console.log(opts)
    //{
    // name:'v1',
    // spec1:'spe11'
    //}
    console.log({
      equal: nIns === beanify // false
    })
    done()
  },
  {
    name: 'v1' //if set name,creates a new scope,
    spec1:'spe11'
  }
)
```

Not create new scope example

```javascript
beanify.register(
  async function (oIns, opts) {
    console.log(opts)
    //{
    // name:'v1'
    //}
    console.log({
      equal: oIns === beanify // true
    })
  },
  {
    // name: 'v1' //if set name,creates a new scope
  }
)
```
