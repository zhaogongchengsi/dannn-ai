/* eslint-disable */
/* prettier-ignore */
// @ts-nocheck
// Generated by unplugin-vue-router. ‼️ DO NOT MODIFY THIS FILE ‼️
// It's recommended to commit this file.
// Make sure to add this file to your tsconfig.json file as an "includes" or "files" entry.

declare module 'vue-router/auto-routes' {
  import type {
    RouteRecordInfo,
    ParamValue,
    ParamValueOneOrMore,
    ParamValueZeroOrMore,
    ParamValueZeroOrOne,
  } from 'vue-router'

  /**
   * Route name map generated by unplugin-vue-router
   */
  export interface RouteNamedMap {
    '/': RouteRecordInfo<'/', '/', Record<never, never>, Record<never, never>>,
    '/chat/': RouteRecordInfo<'/chat/', '/chat', Record<never, never>, Record<never, never>>,
    '/chat/[name]': RouteRecordInfo<'/chat/[name]', '/chat/:name', { name: ParamValue<true> }, { name: ParamValue<false> }>,
    '/home': RouteRecordInfo<'/home', '/home', Record<never, never>, Record<never, never>>,
    '/readme': RouteRecordInfo<'/readme', '/readme', Record<never, never>, Record<never, never>>,
  }
}
