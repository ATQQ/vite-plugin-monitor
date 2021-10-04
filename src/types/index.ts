/**
 * 原来的日志
 */
export interface MonitorOriginData {
    /**
     * debug日志中的第一个时间（xxms）
     */
    time1?: number
    /**
     * debug日志中的第二个时间（+xxms）
     */
    time2?: number
    /**
     * debug打印的原始内容
     */
    originValue?: string
    /**
     * debug打印的原始内容(带颜色)
     */
    chalkValue?: string
}

/**
 * 默认回调函数，对日志做了简单处理
 * @param label 日志类型
 * @param time 消耗时间（time1+time2）
 * @param origin 原日志相关内容
 */
export type MonitorCallback = (label: string, time: number, origin?: MonitorOriginData) => void

/**
 * 拦截debug都打印日志的回调函数
 */
export type DebugCallback = (...argvs: string[]) => void

/**
 * 插件参数
 */
export interface PluginOptions {
    /**
     * 是否在终端中输出原来的日志
     */
    log?: boolean
    /**
     * 默认回调
     */
    monitor?: MonitorCallback

    /**
     * debug回调
     */
    debug?: DebugCallback
}
