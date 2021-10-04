import chalk from 'chalk';

const pluginName = 'vite-plugin-monitor';
export function createLabelKey(label:string) {
  return `_${pluginName}_${label}`;
}

export function getOriginLabel(labelKey:string) {
  return labelKey.replace(`_${pluginName}_`, '');
}

export function timeStart(label: string) {
  const k = createLabelKey(label);
  if (global[k]) {
    return;
  }
  global[k] = Date.now();
}

export function timeEnd(label: string) {
  const k = createLabelKey(label);

  if (!global[k]) {
    return {
      label,
      time: -1,
    };
  }
  const time = Date.now() - global[k];
  // 清空
  global[k] = null;

  if (global[Symbol.for('_monitorLog')]) {
    console.log(chalk.yellow(label), chalk.blue(`${time}ms`));
  }

  const monitor = global[Symbol.for('_monitorCallback')];
  if (monitor) {
    monitor(label, time, {});
  }

  return {
    label,
    time,
  };
}

function ansiRegex({ onlyFirst = false } = {}) {
  const pattern = ['[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)',
    '(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))',
  ].join('|');

  return new RegExp(pattern, onlyFirst ? undefined : 'g');
}

export function resetChalkStr(str) {
  return str.replace(ansiRegex(), '');
}
