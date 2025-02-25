import AiClient, { MoonshotClient, DeepSeekClient } from "./AiClient";
import _ from "lodash";
import JSON5 from "json5";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;

export type Message = {
  role: string;
  content: string;
};

const defaultTaskMark = "[<[([[TASK]])]>]";
const defaultReqMark = "[<[([[REQ]])]>]";
const defaultResMark = "[<[([[RES]])]>]";
const defaultInstructionTemplate = `
你是一个智能函数，根据用户输入的参数，返回相应的处理结果，并以JSON格式输出。
你的功能是：
\`\`\`[<[([[TASK]])]>]\`\`\`
你接受的输入格式是：
\`\`\`[<[([[REQ]])]>]\`\`\`
你应该返回一个JSON对象，格式是：
\`\`\`[<[([[RES]])]>]\`\`\`
需注意：
- 你是一个函数，只能返回JSON格式，不能返回自然语言内容，也不能附带markdown代码块标记（即三个反引号包裹的块"\\\`\\\`\\\`json...\\\`\\\`\\\`"）。
- 如果需要做出解释，可以在返回的JSON对象中附带_msg字段来说明。但如无必要，不建议这样做。
`.trim();
const defaultInstructionTemplateEN = `
You are an AI function, which returns the processing result according to the parameters input by the user and outputs in JSON format.
Your task is:
\`\`\`[<[([[TASK]])]>]\`\`\`
The input format you accept is:
\`\`\`[<[([[REQ]])]>]\`\`\`
You should return a JSON object in the format:
\`\`\`[<[([[RES]])]>]\`\`\`
Note:
- You are a function, can only return JSON format, cannot return natural language content, and cannot attach markdown code block tags (i.e. a block wrapped in three backticks "\\\`\\\`\\\`json...\\\`\\\`\\\`").
- If you really want to explain something, you can attach a \`_msg\` sting field in the returned JSON object, but it's not recommended.
`.trim();

class AiFunc {
  name: string;
  desc: string;  // for human
  ai: AiClient;

  task: string;
  reqFormat: string;
  resFormat: string;

  template: string;
  taskMark: string;
  reqMark: string;
  resMark: string;

  instruction: string;
  schema: Any;

  constructor(dict:Any) {
    this.name = dict?.["name"] ?? "";
    this.desc = dict?.["desc"] ?? "";
    this.ai = new AiClient(dict?.["ai"]);

    this.task = dict?.["task"] ?? "";
    this.reqFormat = dict?.["reqFormat"] ?? "";
    this.resFormat = dict?.["resFormat"] ?? "";

    if (!_.isString(this.resFormat)) {
      this.resFormat = JSON.stringify(this.resFormat);
    }

    this.template = (dict?.["template"]?.length ? dict?.["template"] : null) ?? defaultInstructionTemplateEN ?? defaultInstructionTemplate;
    this.taskMark = (dict?.["taskMark"]?.length ? dict?.["taskMark"] : null) ?? defaultTaskMark;
    this.reqMark = (dict?.["reqMark"]?.length ? dict?.["reqMark"] : null) ?? defaultReqMark;
    this.resMark = (dict?.["resMark"]?.length ? dict?.["resMark"] : null) ?? defaultResMark;

    this.instruction = dict?.["instruction"]?.trim?.()?.length ? dict?.["instruction"] : this.makeInstruction();
    this.schema = dict?.["schema"];
  }

  makeInstruction(
    task: string=this.task,
    reqFormat: string=this.reqFormat,
    resFormat: string=this.resFormat
  ) {
    return this.template.replace(this.taskMark, task).replace(this.reqMark, reqFormat).replace(this.resMark, resFormat);
  }

  async doTask(req: Any, historyMessages: Message[]=[], otherParams: Any={}) {
    const reqString = _.isString(req) ? req : JSON.stringify(req);
    let result = await this.ai.chat(reqString, this.instruction, historyMessages, otherParams) ?? "";
    result = result.trim();
    if (result.slice(0,3)=="```") {
      result = result.replace(/^```[^\n]+\n|```$/g, "").trim();
    }
    try {
      const resultObj = JSON5.parse(result);
      return resultObj;
    } catch(err) {
      const resultObj = {
        _error: "NOT_JSON",
        _output: result,
        _errorString: String(err),
      };
      return resultObj;
    }
  }

  async * doTaskStream(req: Any, historyMessages: Message[]=[], otherParams: Any={}) {
    const reqString = _.isString(req) ? req : JSON.stringify(req);
    for await (const chunk of this.ai.chatStream(reqString, this.instruction, historyMessages, otherParams)) {
      // console.log(chunk);
      yield chunk;
    };
  }


}

export default AiFunc;

class MoonshotAiFunc extends AiFunc {
  constructor(dict:Any) {
    super(dict);
    this.ai = new MoonshotClient(dict?.["ai"]);
  }
}

class DeepSeekAiFunc extends AiFunc {
  constructor(dict:Any) {
    super(dict);
    this.ai = new DeepSeekClient(dict?.["ai"]);
  }
}

export { MoonshotAiFunc, DeepSeekAiFunc };
