import { IconCheck, IconTrashX } from '@tabler/icons';
import * as React from 'react';
import {useTranslation} from 'react-i18next';
import { IconButton } from '../control/icon-button';
import {TextInput} from '../control/text-input';
import { TextSelect } from '../control/text-select';
import { Action, Method } from '../onstart/add-actions';

import './add-rules-button.css';

export interface AddActionProps {
	/**
	 * Called when the user chooses to add a tag. If they are adding a
	 * pre-existing tag, it will only send a name.
	 */
	onAdd: (action:Action) => void;
    onClose: () => void;
    action: Action;
}

export interface Rule {
    operator: string
    operand: string
    actions: Action[][]
    next: string
}

export const AddAction: React.FC<AddActionProps> = props => {
	const {onAdd,onClose,action} = props;
    
	const [_action, _setAction] = React.useState<Action>(action);

	const {t} = useTranslation();

	const handleMethodChange = (event: React.ChangeEvent<HTMLSelectElement>)=>{
		const _method = event.target.value;
		setMethod(_method === "POST" ? Method.POST : Method.GET);
	}

	const cancel = (e:React.MouseEvent<Element, MouseEvent>)=>{
		e.stopPropagation();
	}

    //convert to URL later!
    const setAction = (actionstr: string="")=>{
        _setAction({ 
            ..._action,
            action : actionstr
        })
    }

    const setParams = (params:string="")=>{
        _setAction({ 
            ..._action,
            params 
        })
    }

    const setMethod = (method: Method=Method.GET)=>{
        _setAction({ 
           ..._action,
           method,
        })
    }

    const setDelay = (delay:string="0")=>{
        _setAction({ 
           ..._action,
           delay: isNaN(Number(delay)) ? 0 : Number(delay)
        })
    }

    const _format = (action:Action)=>{
        return {
            ...action,
            delay: isNaN(Number(action.delay)) ? 0 : Number(action.delay),
            method: action.method ? action.method : Method.GET,
            params: action.params || "",
        }

    }

	return (<div className="add-dialogue">
                <div className="heading">add action</div>
                <div className="formItem">
                    <TextInput onChange={e => setAction(e.target.value)} value={_action.action.toString()} helptext={'a url or a tag!'}>tag/url</TextInput>
                </div>
                <div className="formItem">
                    <TextSelect onChange={handleMethodChange} options={[
                        {disabled:false, label:"GET", value:Method.GET},
                        {disabled:false, label:"POST", value:Method.POST}
                        ]} value={_action.method === Method.POST ? Method.POST : Method.GET}>
                        {"method"}
                    </TextSelect>
                </div>
                <div className="formItem">
                    <TextInput onChange={e => setParams(e.target.value)} helptext={`as a tuple e.g ('greeting', ('hello','world))`} value={_action.params||""}>params</TextInput>
                </div>
                <div className="formItem">
                    <TextInput style={{width:60}} onChange={e => setDelay(e.target.value)} helptext={`pause in seconds after successful call`} value={`${_action.delay||0}`}>delay</TextInput>
                </div>
                <div style={{textAlign:"center"}}>
                <IconButton icon={<IconCheck />} iconOnly={true} label={""} onClick={()=>onAdd(_format(_action))} variant="primary"/> 
                <IconButton icon={<IconTrashX />} iconOnly={true} label={""} onClick={onClose} variant="primary"/> 
                </div>
            </div>)

};
