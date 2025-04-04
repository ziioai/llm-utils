
import json5 from 'json5';

export const badJSONParser = (jsonStr: string) => {
  const newStr = jsonStr.trim()
  .replace(/\<think\>[\s\S]*\<\/think\>/g, '').trim()
  .replace(/^```[^\n]*|```$/g, '').trim();
  try {
    return json5.parse(newStr);
  } catch (error1) {
    try {
      return json5.parse(newStr.slice(1));
    } catch (error2) {
      console.error({error1, error2});
      return newStr;
    }
  }
};

export const badJSONLinesParser = (jsonStr: string) => {
  const newStr = jsonStr.trim()
  .replace(/\<think\>[\s\S]*\<\/think\>/g, '').trim()
  .replace(/^```[^\n]*|```$/g, '').trim();
  const lines = newStr.split("\n").filter(it=>it.trim().length>0);
  try {
    return lines.map(str=>json5.parse(str));
  } catch (error1) {
    console.error({error1});
    return newStr;
  }
};
