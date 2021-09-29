import { ClassDeclaration, ImportDeclaration, Project } from 'ts-morph';
import { Dependency, ParsedTarget } from './types';
import {
  fromPascalToKebabCase,
  grabFilesSync,
  lowerFirst,
  removeClassGeneric,
} from './utils';
import {
  generateDependenciesTmpl,
  generateImportsTmpl,
  generateSpecTmpl,
  generateUtilFnTmpl,
} from './templates';
import { setupFunctions } from './get-functions';

function setupClassTarget(classes: ClassDeclaration[]): ParsedTarget {
  const target: ParsedTarget = {
    name: undefined,
    dependencies: [],
    imports: [],
    functions: undefined,
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

function setupImportDeclarations(
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
    const functions = sourceFile.getFunctions();
    const target = setupClassTarget(classes);
    target.imports = setupImportDeclarations(imports, target.dependencies);
    target.functions = setupFunctions(functions);
    targets.push(target);
  }
  return targets;
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
    const { name, dependencies, imports, functions } = target;
    const dependenciesTmpl =
      dependencies?.length > 0
        ? generateDependenciesTmpl(name, dependencies)
        : `const ${lowerFirst(name)} = new ${name}();`;
    const filename = `${fromPascalToKebabCase(name)}.spec.ts`;
    const importsTmpl = generateImportsTmpl(imports);
    const functionsTmpl = generateUtilFnTmpl(functions);
    const template = generateSpecTmpl(
      name,
      dependenciesTmpl,
      importsTmpl,
      functionsTmpl
    );
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
