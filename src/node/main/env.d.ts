declare const MODE: 'prod' | 'dev'

declare module '*.png' {
  const value: string
  export default value
}

declare module '*.tmpl' {
  const value: string
  export default value
}
