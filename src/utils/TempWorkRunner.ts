
import _ from 'lodash';

import { LLMRole } from '../../lib/types/BasicTypes';
import type { Message, MessagesTemplateItem, MessagesTemplateArgs, LLMWorkOptions } from '../../lib/types/BasicTypes';

export const systemPrompt = `
### 你是谁
你是一个汉语构词法分类器，你的任务是将给定的词语拆解为多个成分，将其构词方式归入合适的分类，同时维护一个构词方式的分类体系。

### user 是谁
user 并不是通常意义上的人类用户，而是一个数据接口，会为你提供目前已有的分类体系，以及需要处理的词语。
user 将提供：
- 一个分类体系，包含若干分类，每个分类包含若干词语的构词方式。
- 一个需要处理的词语。

### 关于分类体系
构词方式的分类体系由一个分类列表构成，每种分类是一个 json 对象，包含以下字段：
- \`name\`：string，表示分类的名称。
- \`desc\`：string，表示分类的描述。
- \`partNames\`：string[]，表示该分类的词语所拆解出的各个成分的名称。
- \`examples\`：string[]，表示该分类的一些例词，通常大约5个。
注意：

### 你的任务
1. 对给定的词语进行初步分析，拆解出各个成分。
2. 尝试根据现有分类体系，将该词语的构词方式归入合适的分类。
3. 如果你认为分类体系已经足够完善，你可以选择将该词语归入某个分类。
4. 如果你认为分类体系还不够完善，你可以选择新建一个分类，或者修改一个分类。
5. 你也可以选择删除一个分类，但是请谨慎操作。

### 输出格式
你需要严格遵循json格式进行输出，不要带有md格式的代码块标记等其他多余的内容。
你应该输出一个json对象，包含以下字段：
- \`word\`：string，必有，表示给定的词语。
- \`analyze\`：string，必有，你对给定的词语的初步分析。注意必须尽可能简洁明了，字数尽可能少。
- \`parts\`：string[]，必有，表示拆解后的各成分的字面字符。
- \`cateSystemIsGood\`：boolean，必有，表示你认为分类体系是否已经足够完善。
- \`newCateNeeded\`：boolean，非必有，表示是否需要新建一个分类。
- \`newCate\`：Category，非必有，表示新建分类的信息。
  - \`name\`：表示新建分类的名称。
  - \`desc\`：表示新建分类的描述。
  - \`partNames\`：表示新建分类的各成分的名称。
  - \`examples\`：表示新建分类的一些例词。
- \`modCateNeeded\`：boolean，非必有，表示是否需要修改一个分类。
- \`modCate\`：Category，非必有，表示修改分类的信息。
  - \`oldName\`：表示要修改的分类的原始名称。
  - \`name\`：表示修改之后的分类名称。
  - \`desc\`：表示修改之后的分类描述。
  - \`partNames\`：表示修改之后的分类的各成分的名称。
  - \`examples\`：表示修改之后的分类的一些例词。
- \`delCateNeeded\`：boolean，非必有，表示是否需要删除一个分类。
- \`delCateName\`：string，非必有，表示要删除的分类的名称。
- \`cate\`：string，必有，表示归入的分类的名称。如果发生了新建、修改、删除分类的操作，该字段应该是这些操作之后的分类结果。
`.trim();

export const messagesTemplate: MessagesTemplateItem[] = [
  {role: LLMRole.System, content: systemPrompt},
  {role: LLMRole.User, content: '==[分类体系]=='},
  {role: LLMRole.User, content: '<%= 分类体系 %>', isTemplate: true, args: ['分类体系']},
  {role: LLMRole.User, content: '==[输入词语]=='},
  {role: LLMRole.User, content: '<%= word %>', isTemplate: true, args: ['word']},
  {role: LLMRole.User, content: '==[请完成任务]=='},
];

export function makeMessagesByTemplate(template: MessagesTemplateItem[], args: MessagesTemplateArgs): Message[] {
  return template.map((item) => {
    if (item.isTemplate) {
      const compiled = _.template(item.content);
      return {role: item.role, content: compiled(args)};
      // https://lodash.com/docs/4.17.15#template
    } else {
      return {role: item.role, content: item.content};
    }
  });
}

export interface Cate {
  name: string;
  desc: string;
  partNames: string[];
  examples: string[];
  oldName?: string;
}

export interface TempWorkResponse {
  word: string;
  analyze: string;
  parts: string[];
  cateSystemIsGood: boolean;
  newCateNeeded?: boolean;
  newCate?: Cate;
  modCateNeeded?: boolean;
  modCate?: Cate;
  delCateNeeded?: boolean;
  delCateName?: string;
  cate: string;
}

export interface CatesWrapper {
  cates: Cate[];
}

export const GenInitialOutput = (): CatesWrapper => ({cates: []});

export const UpdateCatesWrapper = (response: TempWorkResponse, catesWrapper?: CatesWrapper): CatesWrapper => {
  const newCatesWrapper = _.cloneDeep(catesWrapper??GenInitialOutput());
  const { newCateNeeded, newCate, modCateNeeded, modCate, delCateNeeded, delCateName } = response;
  if (newCateNeeded) {
    newCatesWrapper.cates.push(newCate as Cate);
  }
  if (modCateNeeded) {
    const { oldName } = modCate as Cate;
    const idx = newCatesWrapper.cates.findIndex((cate) => cate.name === oldName);
    if (idx >= 0) {
      newCatesWrapper.cates[idx] = modCate as Cate;
    }
  }
  if (delCateNeeded) {
    const idx = newCatesWrapper.cates.findIndex((cate) => cate.name === delCateName);
    if (idx >= 0) {
      newCatesWrapper.cates.splice(idx, 1);
    }
  }
  return newCatesWrapper;
}


export const TempWorkOptions: LLMWorkOptions<string, CatesWrapper> = {
  variables: {
    catesWrapper: GenInitialOutput(),
  },
  messagesGenerator: (args: MessagesTemplateArgs) => makeMessagesByTemplate(messagesTemplate, args),

  responseChunkProcessor: async (responseResult: string, _responseChunk: string): Promise<string> => {
    return responseResult;
  },
  responseResultProcessor: async (responseResult: string) => {
    UpdateCatesWrapper(JSON.parse(responseResult), TempWorkOptions.variables.catesWrapper);
    return TempWorkOptions.variables.catesWrapper;
  },

  onBeforeStart: () => {},
  onAfterStart: () => {},
  onBeforeUpdate: () => {},
  onErrorInUpdate: () => {},
  onAfterUpdate: () => {},
  onBeforeEnd: () => {},
  onAfterEnd: () => {},
};



