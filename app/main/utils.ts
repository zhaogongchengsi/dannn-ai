export function templateReplace(template: string, replacements: { [key: string]: string }): string {
  return template.replace(/'\{\{(\w+)\}\}'/g, (_, key) => {
    return replacements[key] || ''
  })
}

export function getMimeType(filePath: string): string {
  if (filePath.endsWith('.js')) {
    return 'application/javascript'
  }
  else if (filePath.endsWith('.html')) {
    return 'text/html'
  }
  else if (filePath.endsWith('.css')) {
    return 'text/css'
  }
  else if (filePath.endsWith('.json')) {
    return 'application/json'
  }
  else if (filePath.endsWith('.png')) {
    return 'image/png'
  }
  else if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
    return 'image/jpeg'
  }
  // Add more MIME types as needed
  return 'text/plain'
}
