import { WriterFunction } from 'ts-morph';

export interface Dependency {
  name: string | undefined;
  type: string | WriterFunction | undefined;
}

export interface ParsedTarget {
  filename: string | undefined;
  className: string | undefined;
  dependencies: Dependency[] | undefined;
  imports: string[] | undefined;
  functions: FnTargetStruct[] | undefined;
}

export interface FnTargetStruct {
  fnName: string;
  parameters: string[];
}
