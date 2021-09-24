import * as fs from 'fs';
import * as path from 'path';
import {
  ClassDeclaration,
  ImportDeclaration,
  Project,
  WriterFunction,
} from 'ts-morph';

interface Dependency {
  name: string | undefined;
  type: string | WriterFunction | undefined;
}

interface ParsedTarget {
  name: string | undefined;
  dependencies: Dependency[];
  imports: string[];
}

export function fromPascalToKebabCase(
  str: string | undefined
): string | undefined {
  return str?.replace(
    /[A-Z]+(?![a-z])|[A-Z]/g,
    (substring, ofs) => (ofs ? '-' : '') + substring.toLowerCase()
  );
}

export function lowerFirst(word: string | undefined): string | undefined {
  return word && word.replace(word.charAt(0), word.charAt(0).toLowerCase());
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

export function removeClassGeneric(clazz: string): string {
  return clazz.split('<')[0];
}

function setUpClassTarget(classes: ClassDeclaration[]): ParsedTarget {
  const target: ParsedTarget = {
    name: undefined,
    dependencies: [],
    imports: [],
  };
  classes.forEach(clazz => {
    target.name = clazz.getName();
    clazz.getConstructors().forEach(c => {
      c.getParameters().forEach(p =>
        target.dependencies.push({
          name: p.getStructure().name,
          type: removeClassGeneric(<string>p.getStructure().type),
        })
      );
    });
  });
  return target;
}

function setUpImportDeclarations(
  imports: ImportDeclaration[],
  dependencies: Dependency[]
): string[] {
  const importDeclarations = [];
  for (const imp of imports) {
    const impDeclaration = imp.getFullText();
    for (const dependency of dependencies) {
      if (dependency.type && impDeclaration.includes(<string>dependency.type)) {
        importDeclarations.push(impDeclaration);
      }
    }
  }
  return importDeclarations;
}

/**
 * Iterates files, traces classes and parses metadata needed for composing the test template with target instance
 * constructed of mocked instances.
 *
 * Currently targeting classes (useful with Angular components)
 * @param project
 */
function parseTargets(project: Project): ParsedTarget[] {
  const files = grabFilesSync('./'); // grab all files from local folder
  console.log('grabbed ', files);
  const targets = [];
  for (const filePath of files) {
    project.addSourceFileAtPath(filePath);
    const sourceFile = project.getSourceFileOrThrow(filePath);
    const imports = sourceFile.getImportDeclarations();
    const classes = sourceFile.getClasses();
    const target = setUpClassTarget(classes);
    target.imports = setUpImportDeclarations(imports, target.dependencies);
    targets.push(target);
  }
  return targets;
}

function generateDependenciesTmpl(
  testedClass: string | undefined,
  dependencies: Dependency[]
): string {
  const setUpInstances = dependencies.reduce((acc, dependency) => {
    const normDepName = lowerFirst(dependency?.name);
    return (
      acc +
      `const ${lowerFirst(dependency?.name)}Mock = mock(${dependency.type});
  const ${normDepName}Instance = instance(${normDepName}Mock);
  `
    );
  }, '');

  const mockedDependenciesInject = dependencies.reduce(
    (acc: string, dependency, i) => {
      const normDepName = lowerFirst(dependency?.name);
      return i < dependencies.length - 1
        ? acc + `${normDepName}Instance, `
        : acc + `${normDepName}Instance`;
    },
    ''
  );

  return `// Mocked dependencies:
  ${setUpInstances}
  // Tested target: 
  const ${lowerFirst(
    testedClass
  )} = new ${testedClass}(${mockedDependenciesInject});
`;
}

function generateImportsTmpl(imports: string[]): string {
  imports.unshift("import { instance, mock, when } from 'ts-mockito';");
  return imports.reduce((acc, imp) => {
    return acc + `${imp}`;
  }, '');
}

function generateSpecTmpl(
  name: string | undefined,
  dependenciesTmpl: string,
  importsTmpl: string
): string {
  return `${importsTmpl}
  
describe('${name}', () => {

  ${dependenciesTmpl}
  it('instance is truthy', () => {
    expect(${lowerFirst(name)}).toBeTruthy();
  });
});
`;
}

/**
 * Entry point
 */
async function generateSpecs(): Promise<void> {
  console.log('\x1b[33m%s\x1b[0m', 'Starting! ❤️'); // yellow logging :)
  const project = new Project();

  const targets = parseTargets(project).filter(t => t?.name);

  console.log(
    'Generating specs for: ',
    targets.reduce((acc: string[], t: ParsedTarget) => {
      acc.push(t.name as string);
      return acc;
    }, [])
  );

  for (const target of targets) {
    const { name, dependencies, imports } = target;
    const dependenciesTmpl =
      dependencies?.length > 0
        ? generateDependenciesTmpl(name, dependencies)
        : `const ${lowerFirst(name)} = new ${name}();`;
    const filename = `${fromPascalToKebabCase(name)}.spec.ts`;
    const importsTmpl = generateImportsTmpl(imports);
    const template = generateSpecTmpl(name, dependenciesTmpl, importsTmpl);
    const specFile = project.createSourceFile(filename, writer =>
      writer.writeLine(template)
    );
    await specFile.save();
  }
  return void 0;
}

generateSpecs()
  .then()
  .catch(e => console.log(e));
