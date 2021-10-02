import { FunctionDeclaration } from 'ts-morph';
import { FnTargetStruct } from './types';

export function setupFunctions(
  functionDeclarations: FunctionDeclaration[]
): FnTargetStruct[] {
  if (!functionDeclarations) return [];
  const targets = [];
  for (const fn of functionDeclarations) {
    if (fn.hasExportKeyword()) {
      // grabbing only exported functions
      const fnTargetStruct = {
        fnName: fn.getName(),
        parameters: [],
      } as any;
      fn.getParameters().forEach(p => {
        fnTargetStruct.parameters.push(p.getName());
      });
      targets.push(fnTargetStruct);
    }
  }
  return targets;
}
