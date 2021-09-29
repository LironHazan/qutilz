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

export function generateImportsTmpl(imports: string[]): string {
  imports.unshift("import { instance, mock, when } from 'ts-mockito';");
  return imports.reduce((acc, imp) => acc + `${imp}`, '');
}

export function generateSpecTmpl(
  className: string | undefined,
  dependenciesTmpl: string | undefined,
  importsTmpl: string,
  functionsTmpl: string | undefined
): string {
  if (functionsTmpl && className) {
    return `${importsTmpl}
  
describe('${className}', () => {

  ${dependenciesTmpl}
  it('instance is truthy', () => {
    expect(${lowerFirst(className)}).toBeTruthy();
  });
});
${functionsTmpl}
`;
  } else if (!functionsTmpl && className) {
    return `${importsTmpl}
  
describe('${className}', () => {

  ${dependenciesTmpl}
  it('instance is truthy', () => {
    expect(${lowerFirst(className)}).toBeTruthy();
  });
});`;
  } else if (functionsTmpl && !className) {
    return functionsTmpl;
  } else return '';
}

//todo: add import support for exported functions
export function generateUtilFnTmpl(
  functions: FnTargetStruct[] | undefined
): string | undefined {
  if (!functions) return undefined;
  const fns = functions?.reduce(
    (acc, fn) =>
      acc +
      `it('should test ${fn.fnName}', () => {
      expect(${fn.fnName}).toBeTruthy();
    });`,
    ''
  );
  return `describe('Testing', () => {

   ${fns}

  });
  `;
}
