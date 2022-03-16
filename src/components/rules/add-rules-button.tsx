import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {IconPlus} from '@tabler/icons';
import {CardContent} from '../container/card';
import {CardButton} from '../control/card-button';
import { AddButtonRules } from './add-button-rules';
import { AddSpeechRules } from './add-speech-rules';

import './add-rules-button.css';
import {Rule} from './add-button-rules';

export interface AddRuleButton {
	icon?: React.ReactNode;
	label?: string;
	type: string;
	onAdd: (rules:Rule[]) => void;
    rules: Rule[];
}

export const AddRulesButton: React.FC<AddRuleButton> = props => {
	const {icon, label, type, onAdd} = props;
	const [creatingStart, setCreatingStart] = React.useState(true);
	const [open, setOpen] = React.useState(false);
	const {t} = useTranslation();

	let validationMessage: string | undefined = undefined;

	return (
		<span className="add-tag-button">
			<CardButton
				disabled={false}
				icon={icon ?? <IconPlus />}
				label={label ?? t('common.rules')}
				onChangeOpen={()=>{
					setOpen(true)
				}}
				open={open}
			>
				<CardContent style={{width:400, maxHeight:400, overflowY:"auto"}}>
					
                    {type === "button" && <AddButtonRules onCancel={()=>{setOpen(false)}} type={type} rules={props.rules}  onAdd={(rules:Rule[])=>{
						setOpen(false);
						onAdd(rules);
					}}/>}
  					
					{type === "speech" && <AddSpeechRules onCancel={()=>{setOpen(false)}} type={type} rules={props.rules}  onAdd={(rules:Rule[])=>{
						setOpen(false);
						onAdd(rules);
					}}/>}

					{creatingStart && !!validationMessage && <p>{validationMessage}</p>}
				</CardContent>
				
			</CardButton>
		</span>
	);
};
