import * as React from 'react';
import {useTranslation} from 'react-i18next';
import { Color} from '../../util/color';
import {TextInput} from '../control/text-input';

import './add-onstart-button.css';

export interface AddSpeechProps {
	onAdd: (name: string, color?: Color) => void;
}

export const AddSpeech: React.FC<AddSpeechProps> = props => {
	const {onAdd} = props;
	const [action, setAction] = React.useState('');
	const {t} = useTranslation();
	return (<TextInput onChange={e => setAction(e.target.value.replace(/\s/g, '-'))} value={action}>Speech</TextInput>);
};
