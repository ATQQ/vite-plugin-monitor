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

  const callback = global[Symbol.for('_monitorCallback')];
  if (callback) {
    callback(label, time);
  }

  return {
    label,
    time,
  };
}
