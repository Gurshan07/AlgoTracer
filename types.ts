export interface Variable {
  name: string;
  initialValue: any;
  scope: 'global' | 'function' | 'block';
  value?: any; // Current value during simulation
}

export interface DataStructures {
  arrays: Record<string, any[]>;
  linkedLists: any[];
  stacks: any[];
  queues: any[];
  trees: any[];
  graphs: any[];
}

export interface StepState {
  variables: Record<string, any>;
  dataStructures: DataStructures;
}

export interface Step {
  step: number;
  line: number;
  action: 'assign' | 'compare' | 'iterate' | 'call' | 'return' | 'push' | 'pop' | 'access' | 'update';
  description: string;
  state: StepState;
}

export interface CallStackFrame {
  function: string;
  parameters: Record<string, any>;
  returnValue?: any;
}

export interface Complexity {
  time: string;
  space: string;
}

export interface AnalysisResult {
  language: string;
  assumedInput: Record<string, any>;
  variables: Variable[];
  dataStructures: DataStructures;
  steps: Step[];
  callStack: CallStackFrame[]; // Initial call stack usually empty or main
  complexity: Complexity;
  error?: string;
}
