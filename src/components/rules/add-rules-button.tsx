import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {IconPlus, IconX} from '@tabler/icons';
import {ButtonBar} from '../container/button-bar';
import {CardContent} from '../container/card';
import {CardButton} from '../control/card-button';
import {IconButton} from '../control/icon-button';
import {TextInput} from '../control/text-input';
import {TextSelect} from '../control/text-select';
import {isValidTagName} from '../../util/tag';
import { AddRules } from './add-rules';
//import { AddSpeech } from './add-speech';
import './add-rules-button.css';
//import { Speech } from './add-speech';
import {Action} from '../onstart/add-actions';
import {Rule} from './add-rules';

export interface AddRuleButton {
	
    
	icon?: React.ReactNode;
	/**
	 * Label for the button.
	 */
	label?: string;
	/**
	 * Called when the user chooses to add a tag. If they are adding a
	 * pre-existing tag, it will only send a name.
	 */
	onAdd: (rules:Rule[]) => void;

    rules: Rule[];
}

export const AddRulesButton: React.FC<AddRuleButton> = props => {
	const {icon, label, onAdd} = props;
	const [creatingStart, setCreatingStart] = React.useState(true);
    const [startType, setStartType] = React.useState('');
    const [rules, setRules] = React.useState<Rule[]>(props.rules);

	const [open, setOpen] = React.useState(false);
	const {t} = useTranslation();

	let validationMessage: string | undefined = undefined;
	

	/*if (!canAdd && newName !== '') {
		validationMessage = t('components.addTagButton.invalidName');
	}

	if (canAdd && creatingStart) {
		canAdd = !existingTags.includes(newName);

		if (!canAdd) {
			validationMessage = t('components.addTagButton.alreadyAdded');
		}
	}*/

	function handleAdd() {
		console.log("OK IN HANDLE ADD!!");
		onAdd(rules);
		setOpen(false);
	}

	function handleTypeChange(event: React.ChangeEvent<HTMLSelectElement>) {
		const startType = event.target.value;
		setStartType(startType);
        setCreatingStart(true);
	}

   
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
				<CardContent style={{width:400}}>
					
                    <AddRules onCancel={()=>{setOpen(false)}} onAdd={(rules:Rule[])=>{
						setOpen(false);
						console.log('adding rules', rules);
						onAdd(rules);
					}}/>
                    
					{creatingStart && !!validationMessage && <p>{validationMessage}</p>}
				</CardContent>
				
			</CardButton>
		</span>
	);
};
