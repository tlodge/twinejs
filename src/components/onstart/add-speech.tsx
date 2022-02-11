import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {TextInput} from '../control/text-input';
import {TextArea} from '../control/text-area';

import './add-onstart-button.css';
import { IconButton } from '../control/icon-button';
import { IconPlus } from '@tabler/icons';

export interface Speech {
    words?: string,
    voice?: string,
    rate?: string,
    delay?: string,
}

export interface AddSpeechProps {
	onAdd: (lines:Speech[]) => void,
    lines: Speech[]
}



export const AddSpeech: React.FC<AddSpeechProps> = props => {
	const {onAdd, lines} = props;
    const lastline = lines.length > 0 ? lines[lines.length-1] : {};

	const [words, setWords] = React.useState(lastline.words || '');
    const [voice, setVoice] = React.useState(lastline.voice || '');
    const [rate, setRate]   = React.useState(lastline.rate || '') ;
    const [delay, setDelay] = React.useState(lastline.delay || '');
    const [lineIndex, setLineIndex] = React.useState(Math.max(lines.length-1,0));

    const handleAdd = ()=>{
        const newlines = [...(lines||[]).map((item,i)=>{
            if (i===lineIndex){
                return {words, voice, rate, delay}
            }
            return item;
        }),{}];
        onAdd(newlines);
        setLineIndex(lineIndex+1);
        setWords('');
        setVoice('');
        setRate('');
        setDelay('');
    }

    React.useEffect(()=>{
        if (lineIndex === 0){
            onAdd([{words, voice, rate, delay}]);
        }
        else{
            const newlines = (lines||[]).map((item,i)=>{
                if (i===lineIndex){
                    return {words, voice, rate, delay}
                }
                return item;
            })
            onAdd(newlines)
        }
    },[words,voice,rate,delay]);

    const renderLines = ()=>{
       return  lines.map((line,i)=>(<div key={i} className="lines">
                    <div className={"words"}>{line.words}</div> 
                    <div className={"voice"}>{line.voice}</div>
                    <div className={"rate"}>{line.rate}</div>
                    <div className={"delay"}>{line.delay}</div>
                </div>))
    }

	const {t} = useTranslation();
	
    return (<div className="speechcontainer">
            <div className="speechformitem">
                <TextArea  style={{width:268}} placeholder="something to say" onChange={e => setWords(e.target.value)} value={words}>words</TextArea></div>
            <div className="paramline">
                <TextInput style={{width:100}} placeholder="voice" onChange={e => setVoice(e.target.value)} value={voice}>params</TextInput>
                <TextInput style={{width:60}}  placeholder="rate" onChange={e => setRate(e.target.value)} value={rate}></TextInput>
                <TextInput style={{width:90}}  placeholder="delay(ms)" onChange={e => setDelay(e.target.value)} value={delay}></TextInput>
            </div>
            <IconButton icon={<IconPlus />} label={'add more speech'} onClick={handleAdd} variant="create"/>
            {renderLines()}
        </div>);
}
