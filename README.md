# IPX

[![NPM Vernion](https://flat.badgen.net/npm/v/ipx)](https://www.npmjs.com/package/ipx)
[![NPM Downloads](https://flat.badgen.net/npm/dt/ipx)](https://www.npmjs.com/package/ipx)
[![Package Size](https://flat.badgen.net/packagephobia/install/ipx)](https://packagephobia.now.sh/result?p=ipx)

High performance, secure and easy to use image proxy based on [sharp](https://github.com/lovell/sharp) and [libvips](https://github.com/libvips/libvips).

<h2 align="center">Usage</h2>

### Quick Start

You can use `ipx` command to start server using:

```bash
$ npx ipx
```

The default server directory is the current working directory.

### Programatic Usage

You can use IPX as a Connect/Express middleware or directly use ipx api.

```js
import { createIPX, createIPXMiddleware } from "ipx";

const ipx = createIPX(/* options */);
const app = express();
app.use("/image", createIPXMiddleware(ipx));
```

### Examples

> The examples assume that a `static` folder with `buffalo.png` file is present in the directory where IPX server is running.

Get original image:

`http://localhost:3000/_/static/buffalo.png`

Change format to `webp` and keep other things same as source:

`http://localhost:3000/f_webp/static/buffalo.png`

Keep original format (`png`) and set width to `200`:

`http://localhost:3000/w_200/static/buffalo.png`

Resize to `200x200px` using `embed` method and change format to `webp`:

`http://localhost:3000/embed,f_webp,s_200x200/static/buffalo.png`

### Modifiers

| Property    | Docs                                                            | Example                                                 | Comments                                                                                                                                                          |
| ----------- | :-------------------------------------------------------------- | :------------------------------------------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| width / w   | \_                                                              | `http://localhost:3000/width_200/buffalo.png`           |
| height / h  | \_                                                              | `http://localhost:3000/height_200/buffalo.png`          |
| resize / s  | \_                                                              | `http://localhost:3000/s_200x200/buffalo.png`           |
| trim        | [Docs](https://sharp.pixelplumbing.com/api-resize#trim)         | `http://localhost:3000/trim_100/buffalo.png`            |
| format      | [Docs](https://sharp.pixelplumbing.com/api-output#toformat)     | `http://localhost:3000/format_webp/buffalo.png`         | Supported format: `jpg`, `jpeg`, `png`, `webp`, `avif`, `gif`, `heif`                                                                                             |
| quality / q | \_                                                              | `http://localhost:3000/quality_50/buffalo.png`          | Accepted values: 0 to 100                                                                                                                                         |
| rotate      | [Docs](https://sharp.pixelplumbing.com/api-operation#rotate)    | `http://localhost:3000/rotate_45/buffalo.png`           |
| enlarge     | \_                                                              | `http://localhost:3000/enlarge,s_2000x2000/buffalo.png` | Allow the image to be upscaled. By default the returned image will never be larger than the source in any dimension, while preserving the requested aspect ratio. |
| flip        | [Docs](https://sharp.pixelplumbing.com/api-operation#flip)      | `http://localhost:3000/flip/buffalo.png`                |
| flop        | [Docs](https://sharp.pixelplumbing.com/api-operation#flop)      | `http://localhost:3000/flop/buffalo.png`                |
| sharpen     | [Docs](https://sharp.pixelplumbing.com/api-operation#sharpen)   | `http://localhost:3000/sharpen_30/buffalo.png`          |
| median      | [Docs](https://sharp.pixelplumbing.com/api-operation#median)    | `http://localhost:3000/median_10/buffalo.png`           |
| gamma       | [Docs](https://sharp.pixelplumbing.com/api-operation#gamma)     | `http://localhost:3000/gamma_3/buffalo.png`             |
| negate      | [Docs](https://sharp.pixelplumbing.com/api-operation#negate)    | `http://localhost:3000/negate/buffalo.png`              |
| normalize   | [Docs](https://sharp.pixelplumbing.com/api-operation#normalize) | `http://localhost:3000/normalize/buffalo.png`           |
| threshold   | [Docs](https://sharp.pixelplumbing.com/api-operation#threshold) | `http://localhost:3000/threshold_10/buffalo.png`        |
| tint        | [Docs](https://sharp.pixelplumbing.com/api-colour#tint)         | `http://localhost:3000/tint_1098123/buffalo.png`        |
| grayscale   | [Docs](https://sharp.pixelplumbing.com/api-colour#grayscale)    | `http://localhost:3000/grayscale/buffalo.png`           |
| animated    | -                                                               | `http://localhost:3000/animated/buffalo.gif`            | Experimental                                                                                                                                                      |

### Config

Config can be customized using `IPX_*` environment variables.

- `IPX_DIR`

  - Default: `.` (current working directory)

- `IPX_DOMAINS`
  - Default: `[]`

<h2 align="center">License</h2>

MIT
