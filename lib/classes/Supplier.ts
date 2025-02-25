

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;

export default class Supplier {
  name: string;
  desc: string = "";
  baseUrl: string;
  defaultModel: string;

  chatUrl?: string;
  modelsUrl?: string;
  balanceUrl?: string;
  countTokenUrl?: string;

  constructor(dict: Any) {

    this.name = dict?.["name"] ?? "";
    this.desc = dict?.["desc"] ?? "";
    this.baseUrl = dict?.["baseUrl"] ?? "";
    this.defaultModel = dict?.["defaultModel"] ?? "";

    this.chatUrl = dict?.["chatUrl"] ?? "";
    this.modelsUrl = dict?.["modelsUrl"] ?? "";
    this.balanceUrl = dict?.["balanceUrl"] ?? "";
    this.countTokenUrl = dict?.["countTokenUrl"] ?? "";

  }

  get hasChatUrl() { return (this.chatUrl?.length ?? 0) > 0; }
  get hasModelsUrl() { return (this.modelsUrl?.length ?? 0) > 0; }
  get hasBalanceUrl() { return (this.balanceUrl?.length ?? 0) > 0; }
  get hasCountTokenUrl() { return (this.countTokenUrl?.length ?? 0) > 0; }

}

export interface SupplierDict {
  name: string;
  desc: string;
  baseUrl: string;
  defaultModel: string;

  chatUrl?: string;
  modelsUrl?: string;
  balanceUrl?: string;
  countTokenUrl?: string;

  models?: {
    id: string;
  }[];
}

