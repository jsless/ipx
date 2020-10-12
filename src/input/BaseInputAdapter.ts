import { Stats } from 'fs-extra'
import { IPXAdapterOptions } from '../types'
import IPX from '../ipx'

export default abstract class BaseInputAdapter {
    ipx: IPX
    options: IPXAdapterOptions

    constructor (ipx: IPX, options: IPXAdapterOptions) {
      this.ipx = ipx
      this.options = options

      this.init()
    }

    init (): void {}
    get name () {
      return this.options.name
    }

    abstract get (src: string): Promise<Buffer>;
    abstract stats (src: string): Promise<Stats | false>;
}
