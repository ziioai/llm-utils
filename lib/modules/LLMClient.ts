import _ from "lodash";
import OpenAI from "openai";
import type {
  Message,
  ChatStreamChunk,
  LifeCycleFns,
  // OldLifeCycleFns,
} from "../types/BasicTypes";



type Any = any;

export type LLMClientDict = {
  baseURL: string;
  apiKey: string;
  defaultModel: string;
  modelsURL?: string;
};



class LLMClient {
  _api: OpenAI;
  baseURL: string;
  apiKey: string;
  defaultModel: string;
  modelsURL?: string;

  constructor(dict: Any) {
    this.loadFromDict(dict);
    this._api = new OpenAI({
      apiKey: this.apiKey,
      baseURL: this.baseURL,
      dangerouslyAllowBrowser: true,
    });
  }

  loadFromDict(dict: Any) {
    this.baseURL = dict?.["baseURL"] ?? dict?.["baseUrl"] ?? "https://api.openai.com/v1";
    this.apiKey = dict?.["apiKey"] ?? "";
    this.defaultModel = dict?.["defaultModel"] ?? "deepseek-chat";
    this.modelsURL = dict?.["modelsURL"] ?? dict?.["modelsUrl"] ?? "/models";
  }

  setAPIKey(apiKey: string) {
    this.apiKey = apiKey;
    this._api.apiKey = apiKey;
  }

  setBaseURL(baseURL: string) {
    this.baseURL = baseURL;
    this._api.baseURL = baseURL;
  }

  setModelsUrl(modelsURL: string) {
    this.modelsURL = modelsURL;
  }

  async listModels() {
    const response = await fetch(`${this.baseURL}${this.modelsURL}`, {
      headers: { 'Authorization': `Bearer ${this.apiKey}` }
    });
    if (!response.ok) { throw new Error(`HTTP error! status: ${response.status}`); }
    return response.json();
  }



  async createChat__(body: Any, options?: Any) {
    return this._api.chat.completions.create(body, options);
  }



  async fetchChatResponse(inputData: Any, options?: Any) {
    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        ...(options?.headers ?? {})
      },
      body: JSON.stringify(inputData)
    });
    return response;
  }

  async createChat(inputData: Any, options?: Any) {
    const response = await this.fetchChatResponse(inputData, options);
    if (!response.ok) { throw new Error(`HTTP error! status: ${response.status}`); }
    return response.json();
  }

  async * createChatStream(inputData: Any, options?: Any): AsyncGenerator<{choices?: any[], done?: boolean}, void, void> {
    try {
      const response = await this.fetchChatResponse(inputData, options);
      if (!response.ok) { throw new Error(`HTTP error! status: ${response.status}`); }

      const reader = response!.body!.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const bufferChunk = decoder.decode(value, { stream: true });
        // console.log(bufferChunk);
        buffer += bufferChunk;

        // 按行分割并解析 JSON
        const lines = buffer.split('\n');
        buffer = lines.pop()??"";  // 剩余部分留在缓冲区

        for (const line of lines) {
          if (!line.trim()?.length) { continue; }
          if (line.trim()==": keep-alive") { continue; }
          // console.log(line);
          try {
            const txt = line.trim().slice(5).trim();
            if (txt=="[DONE]") {
              yield {done: true};
              continue;
            }
            const data = JSON.parse(txt);
            // console.log(data);
            yield data;
          } catch (error) {
            console.error('Error parsing JSON:', error, line);
          }
        }
      }
    } catch (error) {
      console.error('Error streaming LLM JSON data:', error);
      throw error;
    }
  }

  async * chatStream(
    prompt: string,
    systemPrompt: string|undefined=undefined,
    historyMessages: Message[]=[],
    otherParams: Any={},
    emptyInput: boolean=false,
  ): AsyncGenerator<ChatStreamChunk, void, void> {
    for await (const chunk of this.createChatStream({
      model: this.defaultModel,
      messages: [
        ...(systemPrompt?.length ? [{role: "system", content: systemPrompt}] : []),
        ...(historyMessages??[]),
        ...(emptyInput ? [] : [{role: "user", content: prompt}]),
      ],
      // max_tokens: 150,
      temperature: 0.6,
      // temperature: 0.4,
      stream: true,
      ...(otherParams??{})
    })) {
      const delta = chunk?.choices?.[0]?.delta;
      // const reasoning_content = chunk?.choices?.[0]?.delta?.reasoning_content;
      // const content = chunk?.choices?.[0]?.delta?.content;
      if (delta!=null) {
        yield delta;
      }
      if (chunk.done) {
        yield {done: true};
        break;
      }
    }
  }

  async chat(
    prompt: string,
    systemPrompt: string|undefined|null=undefined,
    historyMessages: Message[]=[],
    otherParams: Any={}
  ) {
    const completion = await this.createChat({
      model: this.defaultModel,
      messages: [
        ...(systemPrompt?.length ? [{role: "system", content: systemPrompt}] : []),
        ...(historyMessages??[]),
        {role: "user", content: prompt}
      ],
      // max_tokens: 150,
      temperature: 0.6,
      // temperature: 0.4,
      ...(otherParams??{})
    });
    const { choices=[] } = completion;
    const message = choices?.[0]?.message;
    return message;
  }












  // // 将生命周期处理抽取为独立方法
  // private async handleStreamChunk<CR, TT>(
  //   result: CR,
  //   context: {
  //     chunk: any,
  //     resultText: string,
  //     chunks: any[],
  //   },
  //   lifeCycleFns: LifeCycleFns<CR, TT>,
  // ) {
  //   const { resultText, chunk, chunks } = context;
  //   const {
  //     chunkProcessor,
  //     onBeforeUpdate,
  //     onUpdate,
  //     onAfterUpdate,
  //   } = lifeCycleFns;

  //   const processedChunk = await chunkProcessor?.(result, chunk);
  //   await onBeforeUpdate?.({resultText, chunk, chunks});

  //   const deltaText = chunk==null ? "" : _.isString(chunk) ? chunk : JSON.stringify(chunk);
  //   const newResultText = resultText + deltaText;

  //   await onUpdate?.({deltaText, resultText: newResultText, chunk, chunks, processedChunk});
  //   chunks.push(chunk);

  //   await onAfterUpdate?.({deltaText, resultText: newResultText, chunk, chunks, processedChunk});

  //   return {deltaText, resultText: newResultText};
  // }








  async * chatWithLifeCycle<CR, TT> (
    systemPrompt: string,
    messages: Message[],
    initialResult: CR,
    otherParams?: any,
    lifeCycleFns?: LifeCycleFns<CR, TT>,
  ) {
    const {
      chunkProcessor,
      resultProcessor,

      onStart,

      onBeforeUpdate,
      onAfterUpdate,

      onDone,

      onEnd,

      onCancel,
      onErrorInUpdate,
      onError,
      shouldContinue,
    } = lifeCycleFns??{};

    // const timeStart = Date.now();

    let state = "initialization";
    let result = _.cloneDeep(initialResult);
    let processedChunk = undefined as any;
    let idx = -1;

    state = "beforeStart";
    const ccc0 = await onStart?.({result});
    state = "afterStart";
    result = ccc0?.result ?? result;

    try {
      state = "beforeLoop";
      for await (let chunk of this.chatStream("", systemPrompt, messages, otherParams, true)) {
        try {
          idx += 1;

          if (chunk==null) {
            continue;
          }

          state = `beforeBeforeUpdate_${idx}`;

          const ccc2 = await onBeforeUpdate?.({result, chunk, idx});
          result = ccc2?.result ?? result;
          chunk = ccc2?.chunk ?? chunk;

          state = `beforeChunkProcessor_${idx}`;

          processedChunk = await chunkProcessor?.(result, chunk);
          yield {result, chunk, processedChunk};

          state = `beforeAfterUpdate_${idx}`;

          const ccc3 = await onAfterUpdate?.({result, chunk, processedChunk, idx});
          result = ccc3?.result ?? result;
          chunk = ccc3?.chunk ?? chunk;
          processedChunk = ccc3?.processedChunk ?? processedChunk;

          state = `afterAfterUpdate_${idx}`;

          if (chunk?.done) {
            state = `beforeDone_${idx}`;
            const ccc1 = await onDone?.({result, chunk, processedChunk});
            result = ccc1?.result ?? result;
            chunk = ccc1?.chunk ?? chunk;
            processedChunk = ccc1?.processedChunk ?? processedChunk;
            state = `afterDone_${idx}`;
            break;
          }

          if (shouldContinue!=null && !(await shouldContinue({result, chunk, processedChunk, idx}))) {
            state = `beforeCancel_${idx}`;
            await onCancel?.({result, chunk, processedChunk, idx});
            state = `afterCancel_${idx}`;
            break;
          }

        } catch (error) {
          const ignore = await onErrorInUpdate?.({error, result, chunk, processedChunk, idx, state});
          if (ignore) { continue; }
          throw error;
        }
      };
      state = "afterLoop";

      state = "beforeFinalResult";
      const finalResult = await resultProcessor?.(result);
      // state = "afterFinalResult";

      state = "beforeEnd";
      await onEnd?.({finalResult, result, processedChunk, idx});
      state = "afterEnd";

      return finalResult;
    } catch (error) {
      const pass = await onError?.({error, result, processedChunk, idx, state});
      if (!pass) {
        console.error('Stream processing error:', error);
        throw new Error(`Chat stream failed: ${error.message}`);
      }
    }
  };









  // async chatWithLifeCycle__Old (
  //   systemPrompt: string,
  //   messages: Message[],
  //   otherParams?: any,
  //   lifeCycleFns?: OldLifeCycleFns,
  // ) {
  //   const { nextTickFn, callback, onUpdate, onDone } = lifeCycleFns??{};

  //   const timeStart = Date.now();
  //   const chunks = [] as any[];
  //   let resultText = "";
  //   for await (const chunk of this.chatStream("", systemPrompt, messages, otherParams, true)) {
  //     // console.log(chunk);
  //     if (chunk?.done) {
  //       onDone?.({resultText, chunk});
  //       break;
  //     }
  //     if (chunk==null) {
  //       continue;
  //     }
  //     const deltaText = chunk==null ? "" : _.isString(chunk) ? chunk : JSON.stringify(chunk);
  //     resultText += deltaText;
  //     // chatData.newMessage = resultText;
  //     onUpdate?.({deltaText, resultText, chunk});
  //     chunks.push(chunk);
  //     await nextTickFn?.();
  //   };
  //   const timeEnd = Date.now();
  //   const timeCost = timeEnd - timeStart;

  //   const report_0 = {result: undefined, jsonError: undefined} as any;
  //   try {
  //     report_0.result = JSON.parse(resultText);
  //   } catch (jsonError) {
  //     report_0.result = resultText;
  //     report_0.jsonError = jsonError;
  //   }

  //   await callback?.(report_0);

  //   const report = {
  //     ...report_0,
  //     chunks, timeCost, timeStart, timeEnd,
  //   };
  //   console.log({report});
  //   return report;
  // };


}

export default LLMClient;
