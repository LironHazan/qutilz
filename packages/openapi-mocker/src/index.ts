const SwaggerParser = require('@apidevtools/swagger-parser');
const { mock } = require('mock-json-schema');

const SCHEMA_PATH = './testfile/pets.json';

export interface Config {
  api: string;
}
/**
 * Returns a promise of a mock or an undefined in case the API doesn't exist.
 * Will throw error when the path contains redundant '/'
 * @param path - Insert a path without a '/' prefix
 * @param method get|post|put|delete|patch
 * @param code 200|201|400|401|403
 * @param options - no nesting level.
 * @param config
 * @return {Promise<*>}
 */
export async function mockResponse<T>(
  path: string,
  method: string,
  code: string,
  //config: Config,
  options: Record<string, T> = {}
) {
  console.log('tbd', options);

  if (path.startsWith('/')) {
    throw new Error('Path should not start with /');
  }
  let returnValue;
  const $refs = await SwaggerParser.resolve(SCHEMA_PATH);
  const values = $refs.values();
  const root = $refs.paths()[0];

  for (const [url, pathStruct] of Object.entries(values[root].paths)) {
    // config?.api + path === url ||
    if (url.endsWith(path)) {
      console.log('sec', url);
      for (const [operation, methodStruct] of Object.entries(<any>pathStruct)) {
        if (method === operation) {
          if ((methodStruct as any).responses) {
            for (const [response_code, value] of Object.entries(
              (methodStruct as any).responses
            )) {
              if (code === response_code) {
                console.log(' (value as any).schema?.$ref', value);

                const maybeValue =
                  (value as any).schema?.$ref &&
                  $refs.get((value as any).schema?.$ref);
                if (maybeValue) {
                  returnValue = mock(maybeValue);
                }
              }
            }
          }
        }
      }
    }
  }
  return returnValue;
}
