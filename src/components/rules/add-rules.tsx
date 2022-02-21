import { IconPlus, IconTestPipe, IconTrashX, IconX } from '@tabler/icons';
import { access } from 'fs';
import * as React from 'react';
import {useTranslation} from 'react-i18next';
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
}

export interface Rule {
    operator: string
    operand: string
    actions: Action[][]
    next: string
}

export const AddRules: React.FC<AddRulesProps> = props => {
	const {onAdd, onCancel} = props;
	

	const {t} = useTranslation();

	const [rulewidth, setRuleWidth] = React.useState(40);
	const [ruleIndex, setRuleIndex] = React.useState(-1);
	const [actionIndex, setActionIndex] = React.useState(0);
	
	const [rules, setRules] = React.useState<Rule[]>([{operator:"equals", operand:"",actions:[],next:""}]);

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
		setRules(rules.reduce((acc:Rule[], item:Rule, i:Number)=>{
			if (i !== index)
				return [...acc, item];
			return [...acc, {...item, operand}];
		},[]));
	}

	const renderRule = (index:number, rule:Rule)=>{
		return (<>
				<div className="rulerow">	
					<div>when</div>
					<div style={{marginTop:2}}>
						<TextInput placeholder="name" style={{padding:2,width:rulewidth}} onChange={e => setOperand(index, e.target.value)} value={rule.operand}></TextInput> 
					</div>
					<div>is pressed, call</div>
				</div>
				{renderActions(index,rule.actions)}
			</>)
	}

	const bootstrap = (index:number)=>{
		return (<>				
				{ruleIndex === index && <AddAction onClose={cancel} onAdd={(_action)=>{cancel();addAction(index,0,_action)}}/>}
				<div style={{textAlign:"center"}}>
					<IconButton icon={<IconPlus />} iconOnly={true} label={""} onClick={()=>setRuleIndex(index)} variant="primary"/> 
				</div>
		</>)
	}
	const renderActions = (index:number, actions:Action[][])=>{
		if (actions.length <= 0){
			return bootstrap(index);
		}else{
			const lines = actions.map((arr, aindex)=>{
				const rows =  arr.map((action=>{
					return <div>
						
						{action.action}
						{action.delay}
					</div>
				}))

				return <div>
					<div>------</div>
					{rows}
					<IconButton icon={<IconPlus />} iconOnly={true} label={""} onClick={()=>{setRuleIndex(index); setActionIndex(aindex)}} variant="primary"/> 
				</div>
				
			})
			return (<>
				{ruleIndex === index && <AddAction onClose={cancel} onAdd={(_action)=>{cancel();addAction(index,actionIndex,_action)}}/>}
				{lines}
				<IconButton icon={<IconTestPipe />} iconOnly={true} label={""} onClick={()=>{setRuleIndex(index); setActionIndex(actions.length+1)}} variant="primary"/> 
				</>
			)
		}
	}

	const renderRules = ()=>{
		return rules.map((r,i)=>{
			return renderRule(i,r);
		});
	}

	return (<><div id="rules">		
				{renderRules()}
			</div>
			<ButtonBar>
			<IconButton
				disabled={false}
				icon={<IconPlus />}
				label={t('common.add')}
				onClick={()=>onAdd(rules)}
				variant="create"
			/>
			<IconButton
				icon={<IconX />}
				label={t('common.cancel')}
				onClick={() => onCancel()}
			/>
		</ButtonBar></>)
};
