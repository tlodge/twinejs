import * as React from 'react';
import {useTranslation} from 'react-i18next';
import { Color} from '../../util/color';
import {TextInput} from '../control/text-input';
import { Action } from '../onstart/add-actions';

import './add-rules-button.css';

export interface AddRulesProps {
	/**
	 * Called when the user chooses to add a tag. If they are adding a
	 * pre-existing tag, it will only send a name.
	 */
	onAdd: (name: string, color?: Color) => void;
}

export interface Rule {
    operator: string
    operand: string
    actions: Action[][]
    next: string
}

export const AddRules: React.FC<AddRulesProps> = props => {
	const {onAdd} = props;
	const [action, setAction] = React.useState('');
	const {t} = useTranslation();

	const [rulewidth, setRuleWidth] = React.useState(50);

	React.useEffect(()=>{
		setRuleWidth(Math.min(200,Math.max(40,action.length*9)));
	},[action])

	return (<div id="rules">
				<div className="rulerow">	
					<div>when</div>
					<div style={{marginTop:2}}><TextInput style={{textAlign:"center",padding:2,width:rulewidth, }} onChange={e => setAction(e.target.value)} value={action}></TextInput> </div>
					<div>is pressed, call</div>
				</div>
			</div>)
};
