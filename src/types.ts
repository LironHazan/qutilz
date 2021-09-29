import { WriterFunction } from 'ts-morph';

export interface Dependency {
  name: string | undefined;
  type: string | WriterFunction | undefined;
}

export interface ParsedTarget {
  name: string | undefined;
  dependencies: Dependency[];
  imports: string[];
  functions: FnTargetStruct[] | undefined;
}

export interface FnTargetStruct {
  fnName: string;
  parameters: string[];
}
