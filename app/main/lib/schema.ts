import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import schema from '../schema.json'

const ajv = new Ajv()
addFormats(ajv)

export const validate = ajv.compile(schema)
