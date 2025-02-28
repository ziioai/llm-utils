import _ from "lodash";
import type { Message, LLMModelOptions } from "../types/BasicTypes";
import LLMClient, { type LLMClientDict } from "./LLMClient";



type Any = any;



class LLMClerk {
  modelOptions?: LLMModelOptions;
  variables: Record<string, any>;

}

export default LLMClerk;
