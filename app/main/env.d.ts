declare const MODE: 'prod' | 'dev'

declare module '*.png' {
  const value: string;
  export default value;
}