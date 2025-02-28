
export enum LLMRole {
  System = 'system',
  Assistant = 'assistant',
  User = 'user',
  Tool = 'tool',
  Developer = 'developer',
}

export interface EasyMessage {
  role: LLMRole;
  content: string;
  name?: string;
}

export interface BasicMessage {
  role: LLMRole.System | LLMRole.Developer | LLMRole.User | LLMRole.Assistant;
  content: string;
  name?: string;
}
// https://api-docs.deepseek.com/zh-cn/api/create-chat-completion/
// https://platform.moonshot.cn/docs/api/chat

export interface ToolMessage {
  role: LLMRole.Tool;
  content: string;
  // name?: string;
  tool_call_id: string;
}
// https://api-docs.deepseek.com/zh-cn/guides/function_calling
// https://platform.moonshot.cn/docs/guide/use-kimi-api-to-complete-tool-calls

export interface OpenAIAssistantMessage extends BasicMessage {
  role: LLMRole.Assistant;
  refusal?: string | null;
  audio?: null | {
    id: string;
  };
  tool_calls?: {
    id: string;
    type: "function";
    function: {
      name: string;
      arguments: string;
    },
  }[];
  // Deprecated
  function_call?: null | {
    name: string;
    arguments: string;
  };
}
// https://platform.openai.com/docs/api-reference/chat/create

export interface DeepSeekPrefixedAssistantMessage extends BasicMessage {
  role: LLMRole.Assistant;
  prefix: true;
  reasoning_content: string;
}  // base_url="https://api.deepseek.com/beta"  required
// https://api-docs.deepseek.com/zh-cn/guides/chat_prefix_completion

export interface MoonshotPrefixedAssistantMessage extends BasicMessage {
  role: LLMRole.Assistant;
  partial: true;
  content: string;
}
// https://platform.moonshot.cn/docs/api/partial

export type Message = BasicMessage | ToolMessage | DeepSeekPrefixedAssistantMessage | MoonshotPrefixedAssistantMessage;

export interface MessagesTemplateItem {
  role: LLMRole;
  content: string;
  name?: string;

  tool_call_id?: string;
  prefix?: boolean;
  reasoning_content?: string;
  partial?: boolean;

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







export interface ChatReport<T> {
  result: T;
  jsonError?: Error;
  chunks: any[];

  timeStart: number;
  timeCost: number;
  timeEnd: number;
}

export interface ChatStreamContext {

  state?: string;
  idx?: number;

  result?: any;

  chunk?: any;
  processedChunk?: any;

  error?: Error;

  finalResult?: any;
}

export interface ChatStreamChunk {reasoning_content?: any, content?: any, done?: boolean}


export type ChatResponseChunkProcessor<CR> = (responseResult: CR, responseChunk: ChatStreamChunk) => CR | Promise<CR>;
export type ChatResponseResultProcessor<CR, TT> = (responseResult: CR) => TT | Promise<TT>;

export interface OldLifeCycleFns {
  nextTickFn?: any;
  callback?: any;
  onUpdate?: any;
  onDone?: any;
};

export type LifeCycleFn = (context?: ChatStreamContext) => ChatStreamContext | Promise<ChatStreamContext>;

export interface LifeCycleFns<CR, TT> {
  chunkProcessor: ChatResponseChunkProcessor<CR>;
  resultProcessor: ChatResponseResultProcessor<CR, TT>;

  onStart?: LifeCycleFn;

  onBeforeUpdate?: LifeCycleFn;
  onAfterUpdate?: LifeCycleFn;

  onDone?: LifeCycleFn;

  onEnd?: LifeCycleFn;

  onCancel?: (context?: ChatStreamContext) => Promise<void> | void;
  onErrorInUpdate?: (context?: ChatStreamContext) => Promise<boolean> | boolean;
  onError?: (context?: ChatStreamContext) => Promise<boolean> | boolean;
  shouldContinue?: (context?: ChatStreamContext) => Promise<boolean> | boolean; // 每次chunk后检查是否继续
};











export type MessagesGenerator = (args: MessagesTemplateArgs) => EasyMessage[];

export interface LLMWorkOptions<CR, TT> {
  prompt?: string;

  modelOptions?: LLMModelOptions;

  variables: Record<string, any>;

  messagesGenerator: MessagesGenerator;
  chunkProcessor: ChatResponseChunkProcessor<CR>;
  resultProcessor: ChatResponseResultProcessor<CR, TT>;

  // chunkNewString: string;
  // chunkWholeString: string;

  onBeforeStart?: () => void | Promise<void>;
  onAfterStart?: () => void | Promise<void>;

  onBeforeUpdate?: () => void | Promise<void>;
  onErrorInUpdate?: () => void | Promise<void>;
  onAfterUpdate?: () => void | Promise<void>;

  onBeforeEnd?: () => void | Promise<void>;
  onAfterEnd?: () => void | Promise<void>;
  //

  onCancel?: (context: {resultText: string, chunks: any[]}) => Promise<void> | void;
  shouldContinue?: () => Promise<boolean> | boolean; // 每次chunk后检查是否继续

}



