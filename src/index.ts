import * as fs from 'fs';
import * as path from 'path';
import { ClassDeclaration, Project, WriterFunction } from 'ts-morph';

interface Dependency {
  name: string | undefined;
  type: string | WriterFunction | undefined;
}

interface ParsedTarget {
  name: string | undefined;
  dependencies: Dependency[];
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

function setUpClassTarget(classes: ClassDeclaration[]): ParsedTarget {
  const target: ParsedTarget = {
    name: undefined,
    dependencies: [],
  };
  classes.forEach(clazz => {
    target.name = clazz.getName();
    clazz.getConstructors().forEach(c => {
      c.getParameters().forEach(p =>
        target.dependencies.push({
          name: p.getStructure().name,
          type: p.getStructure().type,
        })
      );
    });
  });
  return target;
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
    const classes = sourceFile.getClasses();

    //todo: support imports
    // const imports = sourceFile.getImportDeclarations();
    // imports.forEach(imp=> {
    //   const struct = { file: filePath, imp: imp.getModuleSpecifierValue() };
    //   console.log(JSON.stringify(struct));
    // });

    const target = setUpClassTarget(classes);
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

  return `${setUpInstances} const ${lowerFirst(
    testedClass
  )} = new ${testedClass}(${mockedDependenciesInject});
`;
}

function generateSpecTmpl(
  name: string | undefined,
  dependenciesTmpl: string
): string {
  return `import { instance, mock, when } from 'ts-mockito';
  
describe('${name}', () => {

  ${dependenciesTmpl}
  it('should test', () => {
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
    const { name, dependencies } = target;
    const dependenciesTmpl =
      dependencies?.length > 0
        ? generateDependenciesTmpl(name, dependencies)
        : `const ${lowerFirst(name)} = new ${name}();`;
    const filename = `${fromPascalToKebabCase(name)}.spec.ts`;
    const template = generateSpecTmpl(name, dependenciesTmpl);
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
