export type labelType = 'ready' | 'hmr_update' |'pageLoad'

export type Callback = (label:string, time: number) => void

export interface PluginOptions {
    log?: boolean
    callback?: Callback
}
