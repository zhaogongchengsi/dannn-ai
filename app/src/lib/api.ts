export async function validateSchema(value: string) {
  return await window.dannn.validate(value)
}

let root: string | null = null
export async function getExtensionsRoot() {
  if (root) {
    return root
  }
  root = await window.dannn.ipc.invoke<string>('constants.EXTENSIONS_ROOT')
  return root
}
