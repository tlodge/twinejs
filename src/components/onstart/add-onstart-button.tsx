import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {IconPlus, IconX} from '@tabler/icons';
import {ButtonBar} from '../container/button-bar';
import {CardContent} from '../container/card';
import {CardButton} from '../control/card-button';
import {IconButton} from '../control/icon-button';
import {TextSelect} from '../control/text-select';
import { AddSpeech } from './add-speech';
import './add-onstart-button.css';
import { Speech } from './add-speech';
import {Action} from './add-actions';
import { Actions } from '../rules/actions';

export interface AddOnStartButtonProps {
	icon?: React.ReactNode;
	label?: string;
	onAdd: (lines:Speech[], actions:Action[][]) => void;
    onClose : ()=>void
    lines: Speech[]
    actions: Action[][]
}

export const AddOnStartButton: React.FC<AddOnStartButtonProps> = props => {

	const {icon, label, onAdd,onClose} = props;
	const [creatingStart, setCreatingStart] = React.useState(true);
    const [startType, setStartType] = React.useState('action');
    const [lines, setLines] = React.useState<Array<Speech>>(props.lines);
    const [actions, setActions] = React.useState<Action[][]>(props.actions);

	const [open, setOpen] = React.useState(false);
	const {t} = useTranslation();

	let validationMessage: string | undefined = undefined;
	let canAdd = lines.length > 0;

	function handleAdd() {
		onAdd(lines,actions);
		setOpen(false);
	}

	function handleTypeChange(event: React.ChangeEvent<HTMLSelectElement>) {
		const startType = event.target.value;
		setStartType(startType);
        setCreatingStart(true);
	}

    const deleteAction = (aindex:number,subindex:number)=>{
        const _actions:Action[][] =  actions.reduce((acc:Action[][], arr:Action[], index:number)=>{
            if (aindex===index){
                if (subindex === 0 && arr.length === 1){
                    return acc;
                }
                return [...acc, arr.reduce((acc:Action[], item:Action, si:number)=>{
                    if (si === subindex)
                        return acc;
                    return [...acc, item];
                },[])]
            }
            return [...acc, arr];
        },[]);
        setActions(_actions);
    }

   
    const addAction = (aindex:number, action:Action)=>{
        if (actions.length === 0){
            setActions([[action]])
        }
        else{
            const _actions:Action[][] =  actions.map((arr, index)=>{
                return index===aindex ? [...arr, action] : arr;
            });
            setActions(_actions);
        }
    }
    

    const editAction = (aindex:number,subindex:number, action:Action)=>{
        const _actions:Action[][] =  actions.reduce((acc:Action[][], arr:Action[], index:number)=>{
            if (aindex===index){
                return [...acc, arr.reduce((acc:Action[], item:Action, si:number)=>{
                    if (si === subindex)
                        return [...acc,action]
                    return [...acc, item];
                },[])]
            }
            return [...acc, arr];
        },[]);
        setActions(_actions);
    }


    const addParallelAction = ()=>{
		setActions([...actions,[{"action":""}]]);
	}

	return (
		<span className="add-tag-button">
			<CardButton
				disabled={false}
				icon={icon ?? <IconPlus />}
				label={label ?? t('common.onstart')}
				onChangeOpen={(e)=>{setOpen(true)}}
				open={open}
			>
            
				<CardContent style={{width:440, padding:15}}>
                    <div className="help">Make something happen immediately when this node is triggered. You could either have a voice in the caravan say something (choose type: speech), and/or you could control the caravan' sensors (choose type:action)</div>
                    <div style={{padding:15, background:"#cfe4fc", borderRadius:5, marginTop:15}}>
                        {/*<TextSelect
                            onChange={handleTypeChange}
                            options={[
                                {disabled:false, label:"action", value:"action"},
                                {disabled:false, label:"speech", value:"speech"}
                            ]}
                            value={startType}
                        >
                            {t('components.onStartButton.selectType')}
                        </TextSelect>*/}
                        {startType === "action" && (
                          
                            <Actions actions={actions} 
                            deleteAction={(a,s)=>deleteAction(a,s)}
                            addAction={(aindex:number, _action:Action)=>{addAction(aindex, _action)}}
                            editAction={(aindex:number, subindex:number, action:Action)=>editAction(aindex,subindex,action)}
                            addParallelAction={()=>addParallelAction()}/>
                            
                        )}
                        {startType === "speech" && (
                            <AddSpeech lines={lines} onAdd={(lines)=>{setLines(lines)}}/>
                        )}
                        </div>
                        {creatingStart && !!validationMessage && <p>{validationMessage}</p>}
                    
				</CardContent>
                <div style={{ display:"flex", justifyContent:"center"}}>
				<ButtonBar>
					<IconButton
						disabled={false}
						icon={<IconPlus />}
						label={t('common.add')}
						onClick={handleAdd}
						variant="create"
					/>
					<IconButton
						icon={<IconX />}
						label={t('common.cancel')}
						onClick={() => {
                            setOpen(false);
                            onClose();
                        }}
					/>
				</ButtonBar>
                </div>
			</CardButton>
		</span>
	);
};
