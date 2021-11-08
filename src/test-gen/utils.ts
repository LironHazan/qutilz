import * as fs from 'fs';
import * as path from 'path';

export function fromPascalToKebabCase(
  str: string | undefined
): string | undefined {
  return str?.replace(
    /[A-Z]+(?![a-z])|[A-Z]/g,
    (substring, ofs) => (ofs ? '-' : '') + substring.toLowerCase()
  );
}

export const lowerFirst = (word: string | undefined): string | undefined =>
  word && word.replace(word.charAt(0), word.charAt(0).toLowerCase());

export function removeClassGeneric(clazz: string): string {
  return clazz.split('<')[0];
}

/**
 * Extracts the filePaths of a local folder, one level - no nesting
 * @param currentDirPath
 */
export function grabFilesSync(currentDirPath: string): string[] {
  return fs
    .readdirSync(currentDirPath)
    .reduce((acc: string[], name: string) => {
      const filePath = path.join(currentDirPath, name);
      const stat = fs.statSync(filePath);
      if (stat.isFile()) {
        acc.push(filePath);
      }
      return acc;
    }, []);
}
