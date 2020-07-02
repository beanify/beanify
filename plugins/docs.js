const fs = require("fs")
const path = require("path")
const envSchema = require("env-schema")
const { dir } = require("console")

module.exports = (beanify, opts, done) => {

  const isProd = () => {
    const SchemaOptions = {
      dotenv: true,
      schema: {
        type: 'object',
        properties: {
          NODE_ENV: {
            type: "string"
          }
        }
      }
    }

    nodeEnv = envSchema(SchemaOptions).NODE_ENV
    return nodeEnv == 'production' || nodeEnv == 'prod'
  }

  if (isProd()) {
    beanify.$log.info('Running in production environment, skipping the generate api docs')
    done()
    return
  }

  if(opts.enable==false){
    beanify.$log.info('skipping the generate api docs')
    done()
    return
  }

  const rootDir = process.cwd()
  const docsDir = path.join(rootDir, opts.dir || 'apis')
  const readMeFilePath = path.join(docsDir, 'README.md')


  if (fs.existsSync(docsDir)) {
    const stat = fs.statSync(docsDir)
    if (stat.isDirectory()) {
      const deleteDir = (pth) => {
        dirs = fs.readdirSync(pth)
        for (const dir of dirs) {
          const fullPath = path.join(docsDir, dir)
          const stat = fs.statSync(fullPath)

          if (stat.isDirectory()) {
            deleteDir(fullPath)
          } else {
            fs.unlinkSync(fullPath)
          }
        }
        fs.rmdirSync(pth)
      }
      deleteDir(docsDir)
    }
  }

  fs.mkdirSync(docsDir)

  fs.writeFileSync(readMeFilePath, `# 接口文档 \r\n\r\n`)

  beanify.addHook('onRoute', (route) => {
    const docs = route.docs || { name: '未知接口', desc: '' }
    const schema = route.schema || { }
    const pubsub = route.$pubsub
    const timeout = route.$timeout
    const url = route.url

    const filePath = path.join(docsDir, `${url}.md`)
    const relativePath = filePath.replace(docsDir, '.')

    if (fs.existsSync(filePath)) {
      throw new Error(`${filePath} Already exists`)
    }

    fs.writeFileSync(filePath, `# ${docs.name} \r\n\r\n`)
    fs.appendFileSync(filePath, `${docs.description || docs.desc} \r\n\r\n`)


    fs.appendFileSync(filePath, `## 基本 \r\n\r\n`)
    fs.appendFileSync(filePath, `* URL:${url} \r\n`)
    fs.appendFileSync(filePath, `* $pubsub:${pubsub} \r\n`)
    fs.appendFileSync(filePath, `* $timeout:${timeout} \r\n`)
    fs.appendFileSync(filePath, `* $useGlobalPrefix:${route.$useGlobalPrefix} \r\n\r\n`)

    fs.appendFileSync(filePath, `## 参数[body] \r\n\r\n`)
    fs.appendFileSync(filePath, '```json\r\n')
    fs.appendFileSync(filePath, JSON.stringify(schema.body, null, '\t'))
    fs.appendFileSync(filePath, '\r\n```\r\n\r\n')

    fs.appendFileSync(filePath, `## 返回[response] \r\n\r\n`)
    fs.appendFileSync(filePath, '```json\r\n')
    fs.appendFileSync(filePath, JSON.stringify(schema.response, null, '\t'))
    fs.appendFileSync(filePath, '\r\n```\r\n\r\n')

    fs.appendFileSync(readMeFilePath,`* [${docs.name}](${relativePath})\r\n`)

  })

  done()
}