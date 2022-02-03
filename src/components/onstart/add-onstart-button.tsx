import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {colors, Color} from '../../util/color';
import {IconPlus, IconX} from '@tabler/icons';
import {ButtonBar} from '../container/button-bar';
import {CardContent} from '../container/card';
import {CardButton} from '../control/card-button';
import {IconButton} from '../control/icon-button';
import {TextInput} from '../control/text-input';
import {TextSelect} from '../control/text-select';
import {isValidTagName} from '../../util/tag';
import { AddActions } from './add-actions';
import { AddSpeech } from './add-speech';
import './add-onstart-button.css';

export interface AddTagButtonProps {
	/**
	 * Tags that have been assigned to this object.
	 */
	assignedTags: string[];
	/**
	 * Is the button disabled?
	 */
	disabled?: boolean;
	/**
	 * Other tags that have been assigned to this type of object.
	 */
	existingTags: string[];
	/**
	 * Icon for the button.
	 */
	icon?: React.ReactNode;
	/**
	 * Label for the button.
	 */
	label?: string;
	/**
	 * Called when the user chooses to add a tag. If they are adding a
	 * pre-existing tag, it will only send a name.
	 */
	onAdd: (name: string, color?: Color) => void;
}

export const AddOnStartButton: React.FC<AddTagButtonProps> = props => {
	const {assignedTags, disabled, existingTags, icon, label, onAdd} = props;
	const [creatingStart, setCreatingStart] = React.useState(true);
	const [newColor, setNewColor] = React.useState<Color>('none');
	const [newName, setNewName] = React.useState('');
    const [startType, setStartType] = React.useState('');

	const [open, setOpen] = React.useState(false);
	const {t} = useTranslation();

	let validationMessage: string | undefined = undefined;
	let canAdd = isValidTagName(newName);

	if (!canAdd && newName !== '') {
		validationMessage = t('components.addTagButton.invalidName');
	}

	if (canAdd && creatingStart) {
		canAdd = !existingTags.includes(newName);

		if (!canAdd) {
			validationMessage = t('components.addTagButton.alreadyAdded');
		}
	}

	function handleAdd() {
		if (creatingStart) {
			onAdd(newName, newColor);
		} else {
			onAdd(newName);
		}

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
				disabled={disabled}
				icon={icon ?? <IconPlus />}
				label={label ?? t('common.onstart')}
				onChangeOpen={setOpen}
				open={open}
			>
				<CardContent>
					<TextSelect
						onChange={handleTypeChange}
						options={[
							{disabled:false, label:"action", value:"action"},
                            {disabled:false, label:"speech", value:"speech"}
						]}
						value={startType}
					>
						{t('components.onStartButton.selectType')}
					</TextSelect>
                    {startType === "action" && (
                        <AddActions onAdd={()=>{}}/>
                    )}
                    {startType === "speech" && (
                        <AddSpeech onAdd={()=>{}}/>
                    )}
					{creatingStart && !!validationMessage && <p>{validationMessage}</p>}
				</CardContent>
				<ButtonBar>
					<IconButton
						disabled={!canAdd}
						icon={<IconPlus />}
						label={t('common.add')}
						onClick={handleAdd}
						variant="create"
					/>
					<IconButton
						icon={<IconX />}
						label={t('common.cancel')}
						onClick={() => setOpen(false)}
					/>
				</ButtonBar>
			</CardButton>
		</span>
	);
};
