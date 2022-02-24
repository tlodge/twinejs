import { IconArrowBarDown, IconArrowBarRight, IconEdit, IconPlus, IconTestPipe, IconTrashX, IconX } from '@tabler/icons';
import { access } from 'fs';
import * as React from 'react';
import {composeInitialProps, useTranslation} from 'react-i18next';
import { Color} from '../../util/color';
import { ButtonBar } from '../container/button-bar';
import { IconButton } from '../control/icon-button';
import {TextInput} from '../control/text-input';
import { TextSelect } from '../control/text-select';
import { Action, AddActions } from '../onstart/add-actions';
import { AddAction } from './add-action';
import './add-rules-button.css';

export interface AddRulesProps {
	/**
	 * Called when the user chooses to add a tag. If they are adding a
	 * pre-existing tag, it will only send a name.
	 */
	onAdd: (rules:Rule[]) => void;
	onCancel:()=>void;
	rules?: Rule[],
}

export interface Rule {
	type?: string,
    operator: string
    operand: string
    actions: Action[][]
    next: string
}

export const AddRules: React.FC<AddRulesProps> = props => {
	const {onAdd, onCancel} = props;
	
	console.log("in add rules with", props.rules);
	const {t} = useTranslation();

	const [rulewidth, setRuleWidth] = React.useState(40);
	const [ruleIndex, setRuleIndex] = React.useState(-1);
	const [actionIndex, setActionIndex] = React.useState(0);
	
	const [rules, setRules] = React.useState<Rule[]>(props.rules || [{operator:"equals", operand:"",actions:[],next:""}]);

	const cancel = ()=>{
		setRuleIndex(-1);
	}

	const insertAction = (actions:Action[][], index:number, action:Action) : Action[][]=>{
		
		if (actions.length <= index){
			return [...actions, [action]];
		}

		return (actions || []).reduce((acc:Action[][],actionarr:Action[],j)=>{
			if (j !== index)
				return [...acc, actionarr]

			return [...acc, [...actionarr, action]]
		},[])
	}

	const addAction = (rindex:number, aindex:number, action:Action)=>{
		const _rules = rules.reduce((acc:Rule[], rule:Rule, i:Number)=>{
			if (i !== rindex)
				return [...acc, rule];
			return [	
				...acc, 
				{
					...rule, 
					actions: insertAction(rule.actions, aindex, action)
				}	
			]
		},[]);
		setRules(_rules);
	}

	const setOperand = (index:number, operand:string)=>{
		setRuleWidth(operand.length * 9);
		setRules(rules.reduce((acc:Rule[], item:Rule, i:number)=>{
			if (i !== index)
				return [...acc, item];
			return [...acc, {...item, operand}];
		},[]));
	}

	const setNext = (index:number, next:string)=>{
		console.log("setting next!!", index, next);

		setRules(rules.reduce((acc:Rule[], item:Rule, i:number)=>{
			if (i !== index)
				return [...acc, item];
			return [...acc, {...item, next}];
		},[]));

		console.log("rules are now", rules.reduce((acc:Rule[], item:Rule, i:number)=>{
			if (i !== index)
				return [...acc, item];
			return [...acc, {...item, next}];
		},[]))
	}

	const renderNext = (index:number, next:string)=>{
		return <div className="rulerow">
			<div>then go to</div>
			<TextInput placeholder="next part" style={{padding:2}} onChange={e => setNext(index,e.target.value)} value={next}></TextInput> 
		</div>
	}
	const renderRule = (index:number, rule:Rule)=>{
		
		return (<div style={{padding:7, background:"#cfe4fc", borderRadius:5, marginBottom:5}}>
				<div className="rulerow">	
					<div>when</div>
					<div style={{marginTop:2}}>
						<TextInput placeholder="name" style={{padding:2,width:Math.max(20,rule.operand.length * 9)}} onChange={e => setOperand(index, e.target.value)} value={rule.operand}></TextInput> 
					</div>
					<div>is pressed, call</div>
				</div>
				{renderActions(index,rule.actions)}
				{renderNext(index,rule.next||"")}
			</div>)
	}

	const bootstrap = (index:number)=>{
		return (<>				
				{ruleIndex === index && <AddAction onClose={cancel} onAdd={(_action)=>{cancel(); addAction(index, 0, _action)}}/>}
				<div style={{textAlign:"center"}}>
					<IconButton icon={<IconPlus />} iconOnly={true} label={""} onClick={()=>setRuleIndex(index)} variant="primary"/> 
				</div>
		</>)
	}
	const renderActions = (index:number, actions:Action[][])=>{
		console.log("rendering actions", actions);

		if (actions.length <= 0){
			return bootstrap(index);
		}else{
			const lines = actions.map((arr, aindex)=>{
				
				const rows =  arr.map((action=>{
					return <div style={{padding:7}}>
						<div style={{display:"flex", flexDirection:"row", alignItems:"center"}}>
							<div style={{display: "flex", flex: "1 1 auto", flexDirection:"column"}}>
								<div style={{padding:4,display:"flex", flexDirection:"column"}}>
									<div style={{flex: "1 1 auto", fontSize:"0.9em", fontWeight:700}}>{action.action.toString()}</div> 
								</div>
								<div style={{padding:4,display:"flex", flexDirection:"row"}}>
									<div style={{flex: "1 1 auto", fontSize:"0.9em"}}>then wait {action.delay} s</div> 
								</div>
							</div>	
							<div style={{display:"flex", flexDirection:"row"}}>
								<IconButton icon={<IconEdit />} iconOnly={true} label={""} onClick={()=>{setRuleIndex(index); setActionIndex(aindex)}} variant="primary"/>
								<IconButton icon={<IconTrashX />} iconOnly={true} label={""} onClick={()=>{setRuleIndex(index); setActionIndex(aindex)}} variant="primary"/>
								<IconButton icon={<IconPlus />} iconOnly={true} label={""} onClick={()=>{setRuleIndex(index); setActionIndex(aindex)}} variant="primary"/>
							</div>
						</div>
					</div>
				}))
				//							
				return <div>
					{rows}
				</div>
				
			})
			return (<>
				<div style={{marginLeft:10}}>
					{ruleIndex === index && <AddAction onClose={cancel} onAdd={(_action)=>{cancel();addAction(index,actionIndex,_action)}}/>}
					{lines}
				</div>
				<IconButton icon={<IconArrowBarRight />} style={{fontSize:"0.8em"}} label={"add parallel action(s)"} onClick={()=>{setRuleIndex(index); setActionIndex(actions.length+1)}} variant="primary"/> 
				</>
			)
		}
	}

	const renderRules = ()=>{
		return rules.map((r,i)=>{
			return renderRule(i,r);
		});
	}

	return (<>
			<div id="rules" style={{marginBottom:40}}>		
				{renderRules()}
				<div style={{textAlign:"center"}}>
					<IconButton icon={<IconPlus />} iconOnly={false} label={"add another rule"} onClick={()=>{}} variant="primary"/>
				</div>
			</div>
			<div style={{position:"fixed", display:"flex", justifyContent:"center", width:370, bottom:0, background:"white"}}>
				<ButtonBar>
					<IconButton
						disabled={false}
						icon={<IconPlus />}
						label={t('Update')}
						onClick={()=>onAdd(rules)}
						variant="create"
					/>
					<IconButton
						icon={<IconX />}
						label={t('common.cancel')}
						onClick={() => onCancel()}
					/>
				</ButtonBar>
			</div>
		</>)
};
