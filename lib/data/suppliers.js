
const suppliers = [


  {
    name: "DeepSeek",
    type: "ChatSupplier",
    desc: "DeepSeek",
    docUrl: "https://platform.deepseek.com/docs",

    baseUrl: "https://api.deepseek.com/v1",
    defaultModel: "deepseek-chat",

    chatUrl: "/chat/completions",
    modelsUrl: "/models",
  },

  {
    name: "阿里云百炼",
    type: "ChatSupplier",
    desc: "阿里云百炼",
    docUrl: "https://help.aliyun.com/zh/model-studio/user-guide/multi-round-conversation?spm=a2c4g.11186623.help-menu-2400256.d_1_0_0_4.1b54b0a8Obvgrf",

    baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    // defaultModel: "qwen-turbo",
    defaultModel: "deepseek-v3",

    chatUrl: "/chat/completions",
    modelsUrl: "/models",
  },

  {
    name: "智增增",
    type: "ChatSupplier",
    desc: "智增增",
    docUrl: "https://doc.zhizengzeng.com/",

    baseUrl: "https://api.zhizengzeng.com/v1",
    defaultModel: "deepseek-chat",

    chatUrl: "/chat/completions",
    modelsUrl: "/models",
  },

  {
    name: "硅基流动",
    type: "ChatSupplier",
    desc: "硅基流动",
    docUrl: "https://docs.siliconflow.cn/",

    baseUrl: "https://api.siliconflow.cn/v1",
    defaultModel: "deepseek-ai/DeepSeek-V3",

    chatUrl: "/chat/completions",
    modelsUrl: "/models",
  },

  {
    name: "ZhiPu",
    type: "ChatSupplier",
    desc: "智谱清言",
    docUrl: "https://open.bigmodel.cn/dev/api",

    baseUrl: "https://open.bigmodel.cn/api/paas/v4",
    defaultModel: "glm-4",

    chatUrl: "/chat/completions",
    modelsUrl: "/models",

    models: [
      { id: "glm-4" },
      { id: "glm-4-air" },
      { id: "glm-4-flash" },
      { id: "glm-3-turbo" },
    ],
  },

  {
    name: "Moonshot",
    type: "ChatSupplier",
    desc: "Moonshot",
    docUrl: "https://platform.moonshot.cn/docs/api-reference",

    baseUrl: "https://api.moonshot.cn/v1",
    defaultModel: "moonshot-v1-8k",

    chatUrl: "/chat/completions",
    modelsUrl: "/models",
    balanceUrl: "/users/me/balance",
    countTokenUrl: "/tokenizers/estimate-token-count",
  },

  {
    name: "OpenAI",
    type: "ChatSupplier",
    desc: "OpenAI",
    docUrl: "https://platform.openai.com/docs/api-reference/chat",

    baseUrl: "https://api.openai.com/v1",
    defaultModel: "gpt-3.5-turbo",

    chatUrl: "/chat/completions",
    modelsUrl: "/models",

    notes: `
    https://cookbook.openai.com/examples/how_to_count_tokens_with_tiktoken
    `.trim(),
  },

  // {
  //   name: "私人转发",
  //   type: "ChatSupplier",
  //   desc: "私人转发",
  //   docUrl: "",

  //   baseUrl: "https://api.132999.xyz/v1",
  //   defaultModel: "gpt-3.5-turbo",

  //   chatUrl: "/chat/completions",
  //   modelsUrl: "/models",
  // },




];

export default suppliers;
