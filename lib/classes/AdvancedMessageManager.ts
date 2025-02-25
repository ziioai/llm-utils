
export enum LLMRole {
  System = 'system',
  Assistant = 'assistant',
  User = 'user',
}

export enum AMMType {
  AdvancedMessageGroup = 'msgG',
}

export interface Message {
  role: LLMRole;
  content: string;
}

export interface AdvancedMessagePlus {
  character?: string;
  state?: {
    completed?: boolean;
    visible?: boolean;
    broken?: boolean;
    forbidden?: boolean;
    invalid?: boolean;
  };
}

export type AdvancedMessage = Message & AdvancedMessagePlus;

export type FuzzyAdvancedMessage = AdvancedMessage | AdvancedMessagePlus;

export interface AdvancedMessageGroup {
  type?: AMMType.AdvancedMessageGroup;
  role: LLMRole;
  messages: FuzzyAdvancedMessage[];
}

