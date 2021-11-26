import { WriterFunction } from 'ts-morph';

export interface Dependency {
  name: string | undefined;
  type: string | WriterFunction | undefined;
}

export interface ParsedTarget {
  filename: string | undefined;
  filePath: string | undefined;
  className: string | undefined;
  dependencies: Dependency[] | undefined;
  imports: string[] | undefined;
  functions: FnTargetStruct[] | undefined;
  methods: ClassMethod[] | undefined;
}

export interface FnTargetStruct {
  fnName: string;
  parameters: string[];
}

export enum MethodType {
  Static = 'static',
  Instance = 'instance',
}

export interface ClassMethod {
  name: string | undefined;
  type: MethodType.Static | MethodType.Instance;
}
