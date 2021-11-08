import { Dependency, FnTargetStruct } from './types';
import { lowerFirst } from './utils';

export function generateDependenciesTmpl(
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

/**
 * Sets up dependencies imports
 * @param imports
 */
export function generateDepImportsTmpl(
  imports: string[] | undefined
): string | undefined {
  imports?.unshift("import { instance, mock, when } from 'ts-mockito';");
  return imports?.reduce((acc, imp) => acc + `${imp}`, '');
}

export function generateSpecTmpl(
  className: string | undefined,
  dependenciesTmpl: string | undefined,
  importsTmpl: string | undefined
): string {
  return `${importsTmpl}
  
describe('${className}', () => {

  ${dependenciesTmpl}
  it('instance is truthy', () => {
    expect(${lowerFirst(className)}).toBeTruthy();
  });
});`;
}

export function generateUtilFnTmpl(
  functions: FnTargetStruct[] | undefined,
  testedTargetImport: string
): string | undefined {
  if (!functions) return undefined;
  const fns = functions?.reduce(
    (acc, fn) =>
      acc +
      `it('should test ${fn.fnName}', () => {
      expect(${fn.fnName}).toBeTruthy();
    });
    
    `,
    ''
  );
  return `${testedTargetImport}
  describe('Testing', () => {

   ${fns}

  });
  `;
}

export function generateTestedTargetsImport(
  filePath: string | undefined,
  testedTarget: string[]
): string {
  // remove suffix from filepath
  const split = filePath?.split('.');
  split?.pop();
  filePath = split?.join('.');
  const targets = testedTarget.reduce((acc, target, i) => {
    return i < testedTarget.length - 1
      ? acc +
          `
  ${target},`
      : acc +
          `
  ${target}`;
  }, '');
  return `import { ${targets} } from '${filePath}'; `;
}
