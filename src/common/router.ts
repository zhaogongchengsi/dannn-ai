type AnyFn = (...args: any[]) => any

interface RouterRecord {
  [key: string]: AnyFn | RouterRecord
}

type RouterReturn<T extends RouterRecord> = {
  [K in keyof T]: T[K] extends AnyFn
    ? T[K]
    : T[K] extends RouterRecord
      ? RouterReturn<T[K]>
      : never;
}

export function router<T extends RouterRecord>(record: T): RouterReturn<T> {
  const result: any = {}
  for (const key in record) {
    const value = record[key]
    if (typeof value === 'function') {
      result[key] = value
    }
    else if (typeof value === 'object' && value !== null) {
      result[key] = router(value as RouterRecord)
    }
  }
  return result
}
