import OpenAI from "openai";
import axios, {AxiosInstance} from "axios";
// import dotenv from "dotenv";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;

// dotenv.config();

type Message = {
  role: string;
  content: string;
};

class AiClient {
  _api: OpenAI;
  _axios: AxiosInstance;
  baseURL: string;
  apiKey: string;
  defaultModel: string;

  constructor(dict:Any) {
    this.baseURL = dict?.["baseURL"] ?? "https://api.openai.com/v1";
    this.apiKey = dict?.["apiKey"] ?? "";
    this.defaultModel = dict?.["defaultModel"] ?? "gpt-3.5-turbo";

    this._api = new OpenAI({
      apiKey: this.apiKey,
      baseURL: this.baseURL,
      dangerouslyAllowBrowser: true,
    });
    this._axios = axios.create({
      baseURL: this.baseURL,
      headers: {
        "Authorization": `Bearer ${this.apiKey}`
      }
    });
  }

  loadDict(dict:Any) {
    this.baseURL = dict?.["baseURL"] ?? "https://api.openai.com/v1";
    this.apiKey = dict?.["apiKey"] ?? "";
    this.defaultModel = dict?.["defaultModel"] ?? "gpt-3.5-turbo";
  }

  async createChat__(body: Any, options?: Any) {
    return this._api.chat.completions.create(body, options);
  }

  async createChat(body: Any, options?: Any) {
    const response = await this._axios.post("/chat/completions", body, options);
    return (response)?.data;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async * createChatStream(inputData: any) {
    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(inputData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response!.body!.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        // console.log(chunk);
        buffer += chunk;

        // 按行分割并解析 JSON
        const lines = buffer.split('\n');
        buffer = lines.pop()??""; // 剩余部分留在缓冲区

        for (const line of lines) {
          if (!line.trim()?.length) { continue; }
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
            console.error('Error parsing JSON:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error streaming LLM JSON data:', error);
      throw error;
    }
  }





  async chat(
    prompt: string,
    systemPrompt: string|undefined=undefined,
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
      temperature: 0.4,
      ...(otherParams??{})
    });
    const { choices=[] } = completion;
    const response = choices?.[0]?.message?.content;
    // console.log(response);
    return response;
  }

  async * chatStream(
    prompt: string,
    systemPrompt: string|undefined=undefined,
    historyMessages: Message[]=[],
    otherParams: Any={},
    emptyInput: boolean=false,
  ) {
    for await (const chunk of this.createChatStream({
      model: this.defaultModel,
      messages: [
        ...(systemPrompt?.length ? [{role: "system", content: systemPrompt}] : []),
        ...(historyMessages??[]),
        ...(emptyInput ? [] : [{role: "user", content: prompt}]),
      ],
      // max_tokens: 150,
      temperature: 0.4,
      stream:true,
      ...(otherParams??{})
    })) {
      if (chunk.done) {
        yield {done: true};
        break;
      }
      yield chunk?.choices?.[0]?.delta?.content;
    }
  }

  async * chatReasoningStream(
    prompt: string,
    systemPrompt: string|undefined=undefined,
    historyMessages: Message[]=[],
    otherParams: Any={},
    emptyInput: boolean=false,
  ) {
    for await (const chunk of this.createChatStream({
      model: this.defaultModel,
      messages: [
        ...(systemPrompt?.length ? [{role: "system", content: systemPrompt}] : []),
        ...(historyMessages??[]),
        ...(emptyInput ? [] : [{role: "user", content: prompt}]),
      ],
      // max_tokens: 150,
      temperature: 0.4,
      stream:true,
      ...(otherParams??{})
    })) {
      if (chunk.done) {
        yield {done: true};
        break;
      }
      const reasoning_content = chunk?.choices?.[0]?.message?.reasoning_content;
      const content = chunk?.choices?.[0]?.message?.content;
      yield {reasoning_content, content};
    }
  }

  setAPIKey(apiKey: string) {
    this.apiKey = apiKey;
    this._api.apiKey = apiKey;
  }
  setBaseURL(baseURL: string) {
    this.baseURL = baseURL;
    this._api.baseURL = baseURL;
  }

  async listModels() {
    const response = await this._axios.get("/models");
    return response.data;
  }

}

export default AiClient;

class MoonshotClient extends AiClient {
  constructor(dict:Any) {
    super(dict);
    this.baseURL = dict?.["baseURL"] ?? "https://api.moonshot.cn/v1";
    this.apiKey = dict?.["apiKey"] ?? "";
    this.defaultModel = dict?.["defaultModel"] ?? "moonshot-v1-8k";
    // moonshot-v1-8k, moonshot-v1-32k, moonshot-v1-128k

    this._api = new OpenAI({apiKey: this.apiKey, baseURL: this.baseURL});
    this._axios = axios.create({
      baseURL: this.baseURL,
      headers: {
        "Authorization": `Bearer ${this.apiKey}`
      }
    });
  }
}

class DeepSeekClient extends AiClient {
  constructor(dict:Any) {
    super(dict);
    this.baseURL = dict?.["baseURL"] ?? "https://api.deepseek.com/v1";
    this.apiKey = dict?.["apiKey"] ?? "";
    this.defaultModel = dict?.["defaultModel"] ?? "deepseek-chat";
    // 模型  描述  上下文长度
    // deepseek-coder  擅长处理编程任务  16K
    // deepseek-chat  擅长通用对话任务  16K

    this._api = new OpenAI({apiKey: this.apiKey, baseURL: this.baseURL});
    this._axios = axios.create({
      baseURL: this.baseURL,
      headers: {
        "Authorization": `Bearer ${this.apiKey}`
      }
    });
  }
}

export { MoonshotClient, DeepSeekClient };
