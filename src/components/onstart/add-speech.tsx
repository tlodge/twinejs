import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {TextInput} from '../control/text-input';
import {TextArea} from '../control/text-area';

import './add-onstart-button.css';
import { IconButton } from '../control/icon-button';
import { IconPlus } from '@tabler/icons';
import { TextSelect } from '../control/text-select';

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
/*
 {name:"Daniel", id:"p226"},
    {name:"Fred", id:"p228"},
    {name:"Richard", id:"p230"},
    {name:"Dave", id:"p231"},
    {name:"Robin", id:"p234"},
    {name:"Charlie", id:"p236"},
    {name:"Kate", id:"p237"},
    {name:"Ed", id:"p239"},
    {name:"Geeta", id:"p240"},
    {name:"Paul", id:"p241"},
    {name:"Eleanor", id:"p243"},
    {name:"Molly", id:"p245"},
    {name:"Izzy", id:"p248"},
    {name:"Holly", id:"p374"},
    {name:"Nadia", id:"p362"},
    {name:"Chloe", id:"p361"},
]*/

const voices = [
    {name:"Daniel"},
    {name:"Fred"},
    {name:"Richard"},
    {name:"Dave"},
    {name:"Robin"},
    {name:"Charlie"},
    {name:"Kate"},
    {name:"Ed"},
    {name:"Geeta"},
    {name:"Paul"},
    {name:"Eleanor"},
    {name:"Molly"},
    {name:"Izzy"},
    {name:"Holly"},
    {name:"Nadia"},
    {name:"Chloe"},
]

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
        setLineIndex(lines.length);
        setWords('some words');
        setVoice('Daniel');
        setRate('');
        setDelay('');
    }

    React.useEffect(()=>{
        const line = lines[lineIndex] || {};
        setWords(line?.words || "");
        setVoice(line?.voice || "Daniel");
        setRate(line?.rate || "180");
        setDelay(line?.delay || "0");
    },[lineIndex])

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
       return  lines.map((line,i)=>(<div onClick={()=>{setLineIndex(i)}} key={i} className="lines">
                    <div className={"words"}>{line.words}</div> 
                    <div className={"voice"}>{line.voice}</div>
                    {/*<div className={"rate"}>{line.rate}</div>*/}
                    <div className={"delay"}>{line.delay}</div>
                </div>))
    }

	const {t} = useTranslation();


    const handleVoiceSelect = (e:React.ChangeEvent<HTMLSelectElement>)=>{
        var audio = new Audio();
        audio.src = `/speechsamples/${e.target.value}.wav`;
        audio.play();
        setVoice(e.target.value)
    }

    return (<div className="speechcontainer">
            <div className="speechformitem">
                <TextArea  style={{width:268}} placeholder="something to say" onChange={e => setWords(e.target.value.replace( /[,]/g," "))} value={words}>words</TextArea></div>
            <div className="paramline">
                <TextSelect onChange={handleVoiceSelect} options={voices.map(a => ({ label: a.name, value: a.name }))} value={voice}>{"voice"}</TextSelect>
                {/*<TextInput style={{width:60}}  placeholder="rate" onChange={e => setRate(e.target.value)} value={rate}></TextInput>*/}
                <TextInput style={{width:90}}  placeholder="delay(ms)" onChange={e => setDelay(e.target.value)} value={delay}></TextInput>
            </div>
            <IconButton icon={<IconPlus />} label={'add more speech'} onClick={handleAdd} variant="create"/>
            {renderLines()}
        </div>);
}
