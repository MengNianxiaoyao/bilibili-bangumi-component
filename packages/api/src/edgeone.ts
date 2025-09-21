import { parseSearchParams } from '../../bilibili-bangumi-component/src/shared/utils'
import { handler as bilibili } from './bilibili'
import { handler as bgm } from './bgm'
import { handleQuery } from './shared/utils'
import { customHandler } from './shared'

export async function onRequestGet({ request, env }: { request: Request, env: NodeJS.ProcessEnv }) {
  const url = new URL(request.url)
  const query = handleQuery(parseSearchParams(url))

  let customSource = {}
  try {
    customSource = customData
  }
  catch {

  }

  if (url.pathname.endsWith('bilibili'))
    return await bilibili(query, env)
  else if (url.pathname.endsWith('bgm'))
    return await bgm(query, env)
  else if (url.pathname.endsWith('custom'))
    return customHandler(query, customSource)

  return Response.json({
    code: 404,
    message: 'not found',
    data: {},
  }, { status: 404 })
}
