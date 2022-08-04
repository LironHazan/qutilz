import { ClassDeclaration, MethodDeclaration } from 'ts-morph';
import { ClassMethod, MethodType, ParsedTarget } from './types';
import { removeClassGeneric } from './utils';

/**
 * Collects all the methods of a given class declaration
 * @param clazz
 */
function collectClassMethods(clazz: ClassDeclaration): ClassMethod[] {
  const methods: ClassMethod[] = [];

  const populateMethod = (m: MethodDeclaration) => {
    const classMethod: ClassMethod = {
      name: m.getName(),
      type: m.isStatic() ? MethodType.Static : MethodType.Instance,
    };
    methods.push(classMethod);
  };
  // If the need was only to collect static I would use: getStaticMethods() but since getMethods()
  clazz.getMethods().forEach(populateMethod);
  return methods;
}

export function setupClassTarget(
  classes: ClassDeclaration[]
): Partial<ParsedTarget> {
  const target = {
    className: undefined,
    dependencies: [],
    methods: [],
  } as Partial<ParsedTarget>;
  classes.forEach((clazz) => {
    target.className = clazz.getName();
    clazz.getConstructors().forEach((c) => {
      c.getParameters().forEach((p) =>
        target.dependencies?.push({
          name: p.getStructure().name,
          type: removeClassGeneric(<string>p.getStructure().type),
        })
      );
    });
    target.methods = collectClassMethods(clazz);
  });
  return target;
}
