import Sharp from 'sharp'
import defu from 'defu'
import imageMeta from 'image-meta'
import { hasProtocol, joinURL, withLeadingSlash } from 'ufo'
import type { Source, SourceData } from './types'
import { createFilesystemSource, createHTTPSource } from './sources'
import { applyHandler, getHandler } from './handlers'
import { cachedPromise, getEnv, createError } from './utils'

// TODO: Move to image-meta
export interface ImageMeta {
  width: number
  height: number
  type: string
  mimeType: string
}

export interface IPXCTX {
  sources: Record<string, Source>
}

export type IPX = (id: string, modifiers?: Record<string, string>, reqOptions?: any) => {
  src: () => Promise<SourceData>,
  data: () => Promise<{
    data: Buffer,
    meta: ImageMeta,
    format: string
  }>
}

export interface IPXOptions {
  dir?: false | string
  domains?: false | string[]
  alias: Record<string, string>,
  // TODO: Create types
  // https://github.com/lovell/sharp/blob/master/lib/constructor.js#L130
  sharp?: { [key: string]: any }
}

// https://sharp.pixelplumbing.com/#formats
// (gif and svg are not supported as output)
const SUPPORTED_FORMATS = ['jpeg', 'png', 'webp', 'avif', 'tiff']

export function createIPX (userOptions: Partial<IPXOptions>): IPX {
  const defaults = {
    dir: getEnv('IPX_DIR', '.'),
    domains: getEnv('IPX_DOMAINS', []),
    alias: getEnv('IPX_ALIAS', {}),
    sharp: {}
  }
  const options: IPXOptions = defu(userOptions, defaults) as IPXOptions

  // Normalize alias to start with leading slash
  options.alias = Object.fromEntries(Object.entries(options.alias).map(e => [withLeadingSlash(e[0]), e[1]]))

  const ctx: IPXCTX = {
    sources: {}
  }

  // Init sources
  if (options.dir) {
    ctx.sources.filesystem = createFilesystemSource({
      dir: options.dir
    })
  }
  if (options.domains) {
    ctx.sources.http = createHTTPSource({
      domains: options.domains
    })
  }

  return function ipx (id, modifiers = {}, reqOptions = {}) {
    if (!id) {
      throw createError('resource id is missing', 400)
    }

    // Enforce leading slash
    id = hasProtocol(id) ? id : withLeadingSlash(id)

    // Resolve alias
    for (const base in options.alias) {
      if (id.startsWith(base)) {
        id = joinURL(options.alias[base], id.substr(base.length))
      }
    }

    const getSrc = cachedPromise(() => {
      const source = hasProtocol(id) ? 'http' : 'filesystem'
      if (!ctx.sources[source]) {
        throw createError('Unknown source: ' + source, 400)
      }
      return ctx.sources[source](id, reqOptions)
    })

    const getData = cachedPromise(async () => {
      const src = await getSrc()
      const data = await src.getData()

      // Extract source meta
      const meta = imageMeta(data) as ImageMeta

      // Determine format
      const mFormat = modifiers.f || modifiers.format
      let format = mFormat || meta.type
      if (format === 'jpg') {
        format = 'jpeg'
      }
      // Use original svg if format not specified
      if (meta.type === 'svg' && !mFormat) {
        return {
          data,
          format: 'svg+xml',
          meta
        }
      }

      // Experimental animated support
      // https://github.com/lovell/sharp/issues/2275
      const animated = modifiers.animated !== undefined || modifiers.a !== undefined
      if (animated) {
        // Gif output needs special libvips build
        // https://github.com/lovell/sharp/pull/2012
        format = 'webp'
      }

      let sharp = Sharp(data, { animated })
      Object.assign((sharp as any).options, options.sharp)

      // Resolve modifiers to handlers and sort
      const handlers = Object.entries(modifiers)
        .map(([name, args]) => ({ handler: getHandler(name), name, args }))
        .filter(h => h.handler)
        .sort((a, b) => {
          const aKey = ((a.handler.order || a.name || '')).toString()
          const bKey = ((b.handler.order || b.name || '')).toString()
          return aKey.localeCompare(bKey)
        })

      // Apply handlers
      const handlerCtx: any = { meta }
      for (const h of handlers) {
        sharp = applyHandler(handlerCtx, sharp, h.handler, h.args) || sharp
      }

      // Apply format
      if (SUPPORTED_FORMATS.includes(format)) {
        sharp = sharp.toFormat(format as any, {
          quality: handlerCtx.quality,
          progressive: format === 'jpeg'
        })
      }

      // Convert to buffer
      const newData = await sharp.toBuffer()

      return {
        data: newData,
        format,
        meta
      }
    })

    return {
      src: getSrc,
      data: getData
    }
  }
}
