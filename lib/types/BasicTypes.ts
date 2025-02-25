
export enum LLMRole {
  System = 'system',
  Assistant = 'assistant',
  User = 'user',
}

export interface Message {
  role: LLMRole;
  content: string;
}

export interface MessagesTemplateItem {
  role: LLMRole;
  content: string;
  isTemplate?: boolean;
  args?: string[];
}

export interface MessagesTemplateArgs {
  [key: string]: string;
}

export interface LLMModelOptions {
  model?: string;
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  [key: string]: any;
}

export type ResponseChunkProcessor<CR> = (responseResult: CR, responseChunk: string) => Promise<CR>;
export type ResponseResultProcessor<CR, TT> = (responseResult: CR) => Promise<TT>;

export interface LLMWorkOptions<CR, TT> {
  prompt?: string;

  modelOptions?: LLMModelOptions;

  variables: {
    [key: string]: any;
  };

  messagesGenerator: (args: MessagesTemplateArgs) => Message[];
  responseChunkProcessor: ResponseChunkProcessor<CR>;
  responseResultProcessor: ResponseResultProcessor<CR, TT>;

  // chunkNewString: string;
  // chunkWholeString: string;

  onBeforeStart?: () => void;
  onAfterStart?: () => void;

  onBeforeUpdate?: () => void;
  onErrorInUpdate?: () => void;
  onAfterUpdate?: () => void;

  onBeforeEnd?: () => void;
  onAfterEnd?: () => void;
  //
}



