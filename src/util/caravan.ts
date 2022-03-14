import { Speech } from "../components/onstart/add-speech";
import { Action } from "../components/onstart/add-actions";
import { Rule } from "../components/rules/add-rules";
import { Method } from "../components/onstart/add-actions";
const DEFAULTRATE 	= 180;
const DEFAULTDELAY 	= 0;
const DEFAULTVOICE = "Daniel";


export interface Node{
    type:string,
    onstart : {
        actions?:Action[][]
        speech?:Speech[]
    }
    rules : Rule[]
}

const extractType = (text:string): string=>{
    const toks = text.split("\n");
    for (let i = 0; i < toks.length; i++){
        if (toks[i].indexOf("[type") != -1){
            const typetoks = toks[i].split(":");
            if (typetoks.length > 1)
                return typetoks[1].replace("]","").trim();
            return "button";
        }
    }
    return "button";
}

const extractOnstart = (text:string) : string=>{
    if (text.indexOf("[onstart]") !== -1){
        return text.substring(text.indexOf("[onstart]")).split("[rules]")[0].replace("[onstart]","").trim();
    }
    return "";
}

const extractRulesText = (text:string) : string=>{
    if (text.indexOf("[rules]") !== -1){
        return text.substring(text.indexOf("[rules]")).replace("[rules]","").trim();
    }
  
    return "";
}

const parseSpeechLine = (line:string) : Speech =>{
    const tokens = line.replace("[speech]","").replace( /[()]/g,"").replace(/["]/g,"").trim().split(',');
    return {
        words:tokens.length > 0 ? tokens[0].trim(): "", 
        voice:tokens.length > 1 ? tokens[1].trim(): `${DEFAULTVOICE}`,
        rate:tokens.length  > 2 ? tokens[2].trim(): `${DEFAULTRATE}`, 
        delay:tokens.length > 3 ? tokens[3].trim(): `${DEFAULTDELAY}`
    }
}

const extractParams = (tuplestr:string="()") : Record<string,any>=>{
    const str = tuplestr.replace( /[(]/g,"{").replace(/[)]/g,"}");
    try{
        return JSON.parse(str);
    }catch(err){
        console.log("error parsing", err);
    }
    return {};
}

const extractParamsString = (str:string)=>{
    const toks = str.trim().substring(1, str.trim().length-1);
    const si = toks.indexOf("(");
    const ei = toks.lastIndexOf(")");
    return si > -1 && ei > -1 ? toks.substring(si,ei+1) : "";
}

const parseActionLine = (line:string) : Action=>{
    const params = extractParamsString(line);
    const toks = line.replace(params,"").replace( /[()]/g,"").replace(/["]/g,"").trim().split(',');
    if (toks.length > 0){
        return {
            action: toks[0].startsWith("http") ? new URL(toks[0]):toks[0], 
            delay: toks.length > 1 ? Number(toks[1].trim()) : 0, 
            params: toks.length > 2 ? params : "",//extractParams(params) : {},
            method: toks.length > 3 ? toks[2] === "POST" ? Method.POST : Method.GET : Method.NONE 
        }
    }
    return {action:""}
}

const extractSpeech = (text:string) : Speech[]=>{
    
    const toks = text.split('\n');
    let line = 0;
    let speech:Speech[] = [];

    const endCondition = (token:string)=>{
        return token.trim() === "" || token.indexOf("[") !== -1;
    }
    while (line < toks.length){
        if (toks[line].trim().startsWith("[speech]")){
            while (++line < toks.length){
                if (!endCondition(toks[line])){
                    speech = [...speech, parseSpeechLine(toks[line])]
                }else{
                    break;
                }	
            }
        }
        line +=1;
    }
    return speech;
}

const extractActions = (text:string) : (Action)[][] =>{


    const toks = text.split('\n');
    let line = 0;
    let actions:Action[][] = [];

    const endCondition = (token:string)=>{
        return token.trim() === "" || token.trim().startsWith("[");
    }

   
    while (line < toks.length){
       
        if (toks[line].trim().startsWith("[action]")){
            let _actions:Action[] = [];
            while (++line < toks.length){
              
                if (!endCondition(toks[line])){
                    _actions = [..._actions, parseActionLine(toks[line])]
                }else{
                    break;
                }	
            }
            actions = [...actions, _actions]
           
        }else{
            line +=1;
        }
    }
  
    return actions;
}

const parseRuleText = (text:string, type:string) : Rule =>{
    const [r, actions] = text.split('[actions]');

    
    const rtoks = r.replace("[[","").replace("]]","").split("|");
    const [operand=""] = rtoks[0].trim().split(" ");
    const next = rtoks.length > 1 ? rtoks[1] : operand;
    return  {
        type,
        operator: 'equals', 
        operand: operand.replace(/\s+/g,""),
        next: next.replace(/\s+/g,""),
        actions : extractActions((actions||"").trim())
    }
}

const extractRules = (text:string): Rule[]=>{
    const toks = text.trim().replace("[rules]","").split('\n');
    let line = 0;
    let rules: Rule[] = [];

    const endCondition = (token:string)=>{
        return /*token.trim() === "" ||*/ token.indexOf("[rule") !== -1;
    }
    while (line < toks.length){
        if (toks[line].trim().startsWith("[rule")){
            let ruletxt = "";
            const [_,_type] = toks[line].replace("[","").replace("]","").split(":");
            const type = _type ? _type : "button";
           
            while (++line < toks.length){
                if (!endCondition(toks[line])){
                    ruletxt += `\n${toks[line]}`;
                }else{
                    break;
                }	
            }
            rules = [...rules, parseRuleText(ruletxt.trim(), type)]
        }else{
            line +=1;
        }
    }
    return rules;
}



const paramToTuple = (params:any) : string=>{
    return params;
}

const actionToString = (actions:Action[], sep:string='\t\t\t'):string=>{
    return (actions || []).reduce((acc:string,a:Action)=>{
        return `${acc}${sep}("${a.action}","${a.delay||0}","${paramToTuple(a.params)}","${a.method}")\n`
    },"");
}

const actionsToString = (actions:Action[][], sep:string='\t\t'): string=>{
    return (actions || []).reduce((acc:string,s:Action[])=>{
        return `${acc}\n${sep}[action]\n${actionToString(s, `${sep}\t`)}`
    },"");
}

const speechFromNode = (node: Node): string=>{
    return (node.onstart.speech || []).reduce((acc:string,s:Speech)=>{
        return `${acc}\t("${s.words}","${s.voice}","${s.rate}","${s.delay}")\n`
    },"");
}

const onStartFromNode = (node:Node):string=>{
    return `\t[speech]\n${speechFromNode(node)}\n\n\t[actions]${actionsToString(node.onstart.actions || [])}`
}

const rulesFromNode = (node:Node):string=>{
    return node.rules.reduce((acc:string, rule:Rule)=>{
        const actionstr = (rule.actions && rule.actions.length > 0) ? `\n\t\t[actions]${actionsToString(rule.actions, '\t\t\t')}`:"";
        return `${acc}\n\t[rule:${rule.type||""}]\n\t\t[[${rule.operand}|${rule.next}]]${actionstr}`
    },"");
}


 /*return [...acc, (rule.actions||[]).reduce((row:string[], arr:Action[][])=>{
            return arr.reduce((row:string[], item:Action[]))=>{
                return [...row, ""];
            },[])     
       },[])]*/

  /*     ...(node.rules || []).reduce((acc:string[], rule:Rule)=>{
        return [...acc, ""];*/

const extractWordsFromParams = (params:string="()"):string[]=>{
    const paramobj = extractParams(params);
    const {body={}} = paramobj;
    const {speech=[]} = body;
    
    return speech.map((w:Record<string,string>) => w.words);
  
   
}

const extractWordsFromActions = (actions: Action[]):string[]=>{
    return actions.reduce((acc:string[], action:Action)=>{
        if (action.action === "say"){
            return [...acc, ...extractWordsFromParams(action.params)]
        }
        return acc;
    },[]);
}

const extractWordsFromActionsArray = (actions:Action[][]):string[]=>{
    return (actions||[]).reduce((acc:string[], arr:Action[])=>{
        return [...acc, ...extractWordsFromActions(arr)]
    },[]);
}

const extractWordsFromNode = (node:Node, lookup:Record<string,string>|never[]) : (string|undefined)[]=>{
    const onstartspeechwords  = [...(node.onstart.speech || []).map(s=>s.words)];
    const onstartactionwords  = [...extractWordsFromActionsArray(node.onstart.actions||[])]
    const rulewords = (node.rules || []).reduce((acc:string[], rule:Rule)=>{
        return [...acc, ...extractWordsFromActionsArray(rule.actions)]
    },[]);
    return [...onstartspeechwords, ...onstartactionwords, ...rulewords];
;}

export function extractWords(passages:string[]){
    const nodes:Node[] = passages.map(p=>convertToObject(p));
    let lookup:Record<string,string>|never[] = [];

    return nodes.reduce((acc:(string|undefined)[], node:Node)=>{
        return [...acc, ...extractWordsFromNode(node,lookup)]
    },[]);

}

export function convertToString(node:Node): string{
    return `[type:${node.type}]\n\n[onstart]\n\n${onStartFromNode(node)}\n[rules]\n${rulesFromNode(node)}`
}

export function convertToObject(text:string): Node{

    const typetext = extractType(text);
    const onstarttext = extractOnstart(text);
    const speech = extractSpeech(onstarttext)
    const actions = extractActions(onstarttext);
    const rules = extractRules(extractRulesText(text));
    
    return {
        type: typetext,
        onstart : {
            speech,
            actions
        },
        rules
    }
}
