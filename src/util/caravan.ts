import { Speech } from "../components/onstart/add-speech";
import { Action } from "../components/onstart/add-actions";
import { Rule } from "../components/rules/add-rules";
import { Method } from "../components/onstart/add-actions";
const DEFAULTRATE 	= 180;
const DEFAULTDELAY 	= 0;
const DEFAULTVOICE = "Daniel";


export interface Node{
    onstart : {
        actions?:Action[][]
        speech?:Speech[]
    }
    rules : Rule[]
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

const extractParams = (tuplestr:string) : object=>{
    if (tuplestr.trim()===""){
        return {};
    }
    const [first, ...rest] = tuplestr.replace( /[()]/g,"").replace(/["]/g,"").trim().split(',');
    return {
        [first] : rest.length > 1 ? extractParams(rest.join(",")) : rest[0]
    }
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
            params: toks.length > 2 ? extractParams(params) : {},
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
        return token.trim() === "" || token.indexOf("[") !== -1;
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

const parseRuleText = (text:string) : Rule =>{
    const [r, actions] = text.split('[actions]');
    const rtoks = r.replace("[[","").replace("]]","").split("|");
    const [operator="", operand=""] = rtoks[0].trim().split(" ");
    const next = rtoks.length > 1 ? rtoks[1] : operand;

    return  {
        operator: operator.replace(/\s+/g,""),
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
        return token.trim() === "" || token.indexOf("[rule]") !== -1;
    }
    while (line < toks.length){
        if (toks[line].trim().startsWith("[rule]")){
            let ruletxt = "";
            while (++line < toks.length){
                if (!endCondition(toks[line])){
                    ruletxt += `\n${toks[line]}`;
                }else{
                    break;
                }	
            }
            rules = [...rules, parseRuleText(ruletxt.trim())]
        }else{
            line +=1;
        }
    }
    return rules;
}


export function convertToObject(text:string): Node{

    const onstarttext = extractOnstart(text); 
    const speech = extractSpeech(onstarttext)
    const actions = extractActions(onstarttext);
    const rules = extractRules(extractRulesText(text));

    return {
        onstart : {
            speech,
            actions
        },
        rules
    }
}

const paramToTuple = (params:any) : string=>{
    if (Object.keys(params).length <= 0)
        return "";
    return Object.keys(params).reduce((acc:string, key:string)=>{
        if ( typeof params[key] === "string"){
            return `${acc}("${key}", "${params[key]}")`
        }else{
            return `${acc}("${key}", ${paramToTuple(params[key])})`
        }
    },"");
}

const actionToString = (actions:Action[], sep:string='\t\t\t'):string=>{
    return (actions || []).reduce((acc:string,a:Action)=>{
        return `${acc}${sep}("${a.action}","${a.delay}","${paramToTuple(a.params)}","${a.method}")\n`
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
        return `${acc}\n\t[rule]\n\t\t[[${rule.operand} ${rule.operator} | ${rule.next}]]\n\t\t[actions]${actionsToString(rule.actions, '\t\t\t')}`
    },"");
}

export function convertToString(node:Node): string{
    return `[onstart]\n\n${onStartFromNode(node)}\n[rules]\n${rulesFromNode(node)}`
}