module.exports = function printTree (opts, level) {
  const { ins, key } = opts
  if (!opts.format) {
    return
  }
  if (!level) {
    level = 0
  }

  let padding = ''
  if (level > 1) {
    padding += '|'.padEnd((level - 1) * 4, ' ')
  }
  padding += '|'
  padding = padding.padEnd(level * 4, '-')
  opts.format(padding, ins)

  const children = ins[key] || []
  children.forEach(child => {
    printTree(
      {
        ins: child,
        key,
        format: opts.format
      },
      level + 1
    )
  })
}
