import type { Plugin } from 'vite'
import { createLabelKey, timeEnd, timeStart } from './utils'

import type { PluginOptions } from './types'


export default function Monitor(ops: PluginOptions = {}): Plugin {
    const { log } = ops
    
    if (log) {
        global[Symbol.for('_monitorLog')] = log
    }

    global[createLabelKey('ready')] = global.__vite_start_time
    
    return {
        name: 'vite-plugin-monitor',
        apply: 'serve',
        // hack获取启动耗时|HMR耗时
        configureServer(server) {
            const info = server.config.logger.info
            server.config.logger.info = function _info(str) {
                info.apply(this, arguments)
                if (str.includes('ready in')) {
                    timeEnd('ready')
                }
                if (str.indexOf('hmr update') >= 0) {
                    timeStart('hmr_update')
                }
            }
            server.middlewares.use(async (req, res, next) => {
                const { search } = new URL(req.url, `http://${req.headers.host}`);
                  if (
                    search.indexOf('import&') >= 0
                  ) {
                    const end = res.end
                    res.end = function _end() {
                      end.apply(this, arguments)
                      timeEnd('hmr_update')
                    }
                  }
                next()
            })
        },
    }
}