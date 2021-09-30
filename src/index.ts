import type { Plugin } from 'vite';
import { createLabelKey, timeEnd, timeStart } from './utils';

import type { PluginOptions } from './types';

export default function Monitor(ops: PluginOptions = {}): Plugin {
  const { log, monitor, debug } = ops;

  if (log) {
    global[Symbol.for('_monitorLog')] = log;
  }

  if (typeof monitor === 'function') {
    global[Symbol.for('_monitorCallback')] = monitor;
  }
  if (typeof debug === 'function' && process.env.DEBUG) {
    const { write } = process.stderr;
    if (log) {
      console.log('vite-plugin-monitor  monitor-debug');
    }
    Object.defineProperty(process.stderr, 'write', {
      get() {
        return function _write(...argvs) {
          // 开启了才打印原来的
          if (log) {
            write.apply(this, arguments);
          }
          const originStr = argvs[0];
          // TODO: 继续,分离 time 中间内容 +xxTime
          const res = originStr.match(/vite:(.*?)\s.*\s(\d+)ms/) || [];
          const [_, tag, time1] = res;
          if (tag && time1) {
            console.log(tag, time1);
          }

          debug(...argvs);
        };
      },
    });
    // 保留原来的
    Object.defineProperty(process.stderr, '_write', {
      get() {
        return write;
      },
    });
  }
  global[createLabelKey('ready')] = global.__vite_start_time;

  return {
    name: 'vite-plugin-monitor',
    apply: 'serve',
    // hack获取启动耗时|HMR耗时
    configureServer(server) {
      const { info } = server.config.logger;
      // eslint-disable-next-line no-param-reassign
      server.config.logger.info = function _info(str) {
        // eslint-disable-next-line prefer-rest-params
        info.apply(this, arguments);
        if (str.includes('ready in')) {
          timeEnd('ready');
        }
        if (str.indexOf('hmr update') >= 0) {
          timeStart('hmr_update');
        }
      };
      // server.middlewares.use()
      server.middlewares.use(async (req, res, next) => {
        const { search } = new URL(req.url, `http://${req.headers.host}`);
        if (
          search.indexOf('import&') >= 0
        ) {
          const { end } = res;
          res.end = function _end() {
            // eslint-disable-next-line prefer-rest-params
            end.apply(this, arguments);
            timeEnd('hmr_update');
          };
        }
        next();
      });
    },
  };
}
