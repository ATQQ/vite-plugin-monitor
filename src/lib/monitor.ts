import type { Plugin } from 'vite';

import { PluginOptions } from '../types';
import {
  createLabelKey, resetChalkStr, timeEnd, timeStart,
} from '../utils';

export default function Monitor(ops: PluginOptions = {}): Plugin {
  const { log, monitor, debug } = ops;

  if (log) {
    global[Symbol.for('_monitorLog')] = log;
  }

  if (typeof monitor === 'function') {
    global[Symbol.for('_monitorCallback')] = monitor;
  }
  if ((typeof debug === 'function' || typeof monitor === 'function') && process.env.DEBUG) {
    const { write } = process.stderr;
    if (log) {
      console.log('vite-plugin-monitor  monitor-debug');
    }
    Object.defineProperty(process.stderr, 'write', {
      get() {
        return function _write(...argv) {
          // 开启了才打印原来的
          if (log && typeof argv[0] === 'string') {
            process.stdout.write(argv[0]);
          }
          const originStr = argv[0];
          const tag = (originStr.match(/vite:(.*?)\s/) || [])[1];
          const time1 = (originStr.replace(/\+\d+ms/, '').match(/(\d+)ms/) || [])[1];
          const time2 = (originStr.match(/\+(\d+)ms/) || [])[1];
          // console.log([originStr.replace(/\\[x]/g, '')]);
          const time = +(time1 || 0) + +(time2 || 0);
          if (tag && monitor) {
            monitor(tag, time, {
              time1: +(time1 || 0),
              time2: +(time2 || 0),
              originValue: resetChalkStr(originStr),
              chalkValue: originStr,
            });
          }
          if (debug) {
            debug(...argv);
          }
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
