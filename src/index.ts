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

function setupClassTarget(classes: ClassDeclaration[]): Partial<ParsedTarget> {
  const target = {
    className: undefined,
    dependencies: [],
  } as Partial<ParsedTarget>;
  classes.forEach(clazz => {
    target.className = clazz.getName();
    clazz.getConstructors().forEach(c => {
      c.getParameters().forEach(p =>
        target.dependencies?.push({
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
  dependencies: Dependency[] = []
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
  const targets = [];
  for (const filePath of files) {
    project.addSourceFileAtPath(filePath);
    const sourceFile = project.getSourceFileOrThrow(filePath);
    const imports = sourceFile.getImportDeclarations();
    const classes = sourceFile.getClasses();
    const functions = sourceFile.getFunctions();
    const { className, dependencies } = setupClassTarget(classes);
    const target = {
      filename: sourceFile.getBaseName(),
      className,
      dependencies,
      imports: setupImportDeclarations(imports, dependencies),
      functions: setupFunctions(functions),
    };

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

  const classBasedTargets = parseTargets(project).filter(t => t?.className);
  const fnBasedTargets = parseTargets(project).filter(
    t => t?.functions && t?.functions.length > 0
  );

  console.log(
    'Generating specs for: ',
    classBasedTargets.reduce((acc: string[], t: ParsedTarget) => {
      acc.push(t.className as string);
      return acc;
    }, [])
  );

  console.log(
    'Generating specs for: ',
    fnBasedTargets.reduce((acc: string[], t: ParsedTarget) => {
      !acc.includes(t.filename as string) && acc.push(t.filename as string);
      return acc;
    }, [])
  );

  for (const target of classBasedTargets) {
    const { className, dependencies, imports } = target;
    const dependenciesTmpl =
      dependencies && dependencies?.length > 0
        ? generateDependenciesTmpl(className, dependencies)
        : `const ${lowerFirst(className)} = new ${className}();`;
    const filename = `${fromPascalToKebabCase(className)}.spec.ts`;
    const importsTmpl = generateImportsTmpl(imports);
    const template = generateSpecTmpl(className, dependenciesTmpl, importsTmpl);
    const specFile = project.createSourceFile(filename, writer =>
      writer.writeLine(template)
    );
    await specFile.save();
  }

  for (const fn of fnBasedTargets) {
    const { filename, functions } = fn;
    const normalizedName = filename?.replace('.ts', '');
    const fname = `${fromPascalToKebabCase(normalizedName)}.spec.ts`;
    const functionsTmpl = generateUtilFnTmpl(functions);
    const specFile = project.createSourceFile(fname, writer =>
      writer.writeLine(functionsTmpl as string)
    );
    await specFile.save();
  }

  return void 0;
}

generateSpecs()
  .then()
  .catch(e => console.log(e));
