export type labelType = 'ready' | 'hmr_update' |'pageLoad'
export interface OriginDat{
    time1?:number
    time2?:number
    originValue?:string
    // TODO:剥离无色值的log内容
    // value?:string
}
export type Callback = (label:string, time: number, origin?:OriginDat) => void

export type DebugCallback = (...argvs:string[]) => void
export interface PluginOptions {
    log?: boolean
    monitor?: Callback
    debug?:DebugCallback
}
