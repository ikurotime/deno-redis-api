import { config } from 'https://deno.land/x/dotenv/mod.ts'
import { Redis } from 'https://deno.land/x/upstash_redis@v1.14.0/mod.ts'
import { Hono } from 'https://deno.land/x/hono/mod.ts'
import { cors } from 'https://deno.land/x/hono/middleware.ts'
import { serve } from 'https://deno.land/std/http/server.ts'

const app = new Hono()
// deno-lint-ignore ban-ts-comment
//@ts-ignore
app.use(
  '/*',
  cors({
    origin: '*'
  })
)
const redis = new Redis({
  url: 'https://divine-wildcat-33504.upstash.io',
  token: config().REDIS_PASSWORD
})

//const foo = await redis.set('valor', 'davorpatech')

app.get('/', (c) => {
  return c.text('Hello World')
})
// GET ALL KEYS
app.get('/get/all', async (c) => {
  // get all values starting with 'valor'
  const keys = await redis.keys('valor*')

  console.log(keys)
  return c.json(keys)
})
//POST NEW KEY
app.post('/post/:id', async (c) => {
  const param = c.req.param()
  const body = await c.req.json()
  await redis.set(param.id + ':' + body.taskId, JSON.stringify(body))
  return c.text('Written: ' + param.id + ' ' + JSON.stringify(body))
})

//GET USER KEYS
app.get('/get/:id', async (c) => {
  const param = c.req.param()
  const keys = await redis.keys(param.id + ':*')
  const values = await redis.mget(...keys)
  return c.json(values)
})
// DELETE USER KEY
app.delete('/delete/:id', async (c) => {
  const param = c.req.param()
  const user = param.id
  const body = await c.req.json()
  const task = user + ':' + body.taskId
  await redis.del(task)
  return c.text('Deleted: ' + task)
})
serve(app.fetch)
