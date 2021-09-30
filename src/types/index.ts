export type labelType = 'ready' | 'hmr_update' |'pageLoad'

export type Callback = (label:string, time: number) => void

export type DebugCallback = (...argvs:string[]) => void
export interface PluginOptions {
    log?: boolean
    monitor?: Callback
    debug?:DebugCallback
}
