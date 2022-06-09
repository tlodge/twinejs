import { IconCheck, IconTrashX, IconUpload } from '@tabler/icons';
import * as React from 'react';
import {useTranslation} from 'react-i18next';
import { IconButton } from '../control/icon-button';
import {TextInput} from '../control/text-input';
import { TextSelect } from '../control/text-select';
import { Action, Method } from '../onstart/add-actions';
import { AddSpeech } from '../onstart/add-speech';
import request from 'superagent';

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

//TODO - put in placeholders for urls!

const actions = [
    {name: "raw", id:"raw", url:"", params:"{}", method:Method.GET, description:"Call this custom url"},
    {name: "arm expand", id:"arm-expand", url:"http://[lenovo]:9107/api/arm/expand", params:"{}", method:Method.GET, description:"This will move the camera arm into the extended state"},
    {name: "arm collapse", id:"arm-collapse", url:"http://[lenovo]:9107/api/collapse", params:"{}", method:Method.GET, description:"This will move the camera arm into the rest state"},
    {name: "fan", id: "fan", url:"http://[lenovo]:9097/ui/api/fan", params:`{"query":{"rotate": true,"power":10,"cool":true,"from":0,"to":90}}`, method:Method.GET, description:"This will control the dyson fan (temperature, air speed, rotation)"},
    /*{name: "smell right on", id: "smell-right-on", url:"http://[smell-right]/on3", method:Method.GET, params:"{}", description:"This will start the right hand side smell actuator"},
    {name: "smell right off", id: "smell-right-off", url:"http://[smell-right]/off", method:Method.GET, params:"{}", description:"This will turn off the right hand side smell actuator"},
    {name: "smell left on", id: "smell-left-on", url:"http://[smell-left]/on3", method:Method.GET, params:"{}", description:"This will start the left hand side smell actuator"},
    {name: "smell left off", id: "smell-left-off", url:"http://[smell-left]/off", method:Method.GET, params:"{}", description:"This will turn off the left hand side smell actuator"},*/
    {name: "nanoleaf", id:"nanoleaf", url:"http://[lenovo]:9104/ui/api/hex", method:Method.GET,params:`{"query":{"hue":203,"sat":91,"brightness":99}}`, description:"This will set the colours of the nanoleaf lights (under the caravan seat)"},
    {name: "hue", id: "huecolour", method:Method.GET,url:"http://[lenovo]:9092/ui/api/hex",  params:`{"query":{"hex":"ff0000"}}`, description:"This will change the hue lights colour"},
    /*{name: "huescript", id: "huescript", method:Method.GET,url:"http://[lenovo]:9092/ui/api/light_script",  params:`{"query":{"script_id":"alightscript"}}`, description:"This will run a pre-authored script that sets the hue light's colours (the strip above the screen)"},*/
    {name: "togglewindows", id: "togglewindows", method:Method.GET,url:"http://[windows]:9222/H",  params:"{}", description:"This will toggle the opacity of the caravan windows"},
    {name: "printline", id: "printline", method:Method.POST, url:"http://[receipt]:8080/print", params:`{"body":{"text":"a line of text"}}`, description:"This will print a line of text on the label printer"},
    {name: "speech", id: "speech", method:Method.POST, url:"http://[speech]:9105/api/speech", params:`{"body":{"speech":[{"words":"a line of speech"}]}}`, description:"This will send text to the speech synthesizer, or if you render, it will play speech generated Mozilla's speech synthesizer"},
    {name: "screen - home", id: "screen-home", method:Method.GET, url:"http://[lenovo]:9102/api/home", params:"{}", description:"This set the caravan screen to the 'future mundane' title"},
    {name: "screen - dyson", id: "screen-dyson", method:Method.GET, url:"http://[lenovo]:9102/api/air", params:"{}", description:"This will show the air quality readings from the dyson fan"},
    {name: "screen - media", id: "screen-media", method:Method.GET, url:"http://[lenovo]:9102/api/media", params:"{}", description:"This will make the caravan screen go black, ready to play a media file.  Follow this action with a 'screen - play' action"},
    {name: "screen - play", id: "screen-media-play", method:Method.GET, url:"http://[lenovo]:9102/api/media/play",  params:`{"query":{"media":"","delay":0}}`, description:"This will play a media (mp4) file, which must be in the media directory on the lenovo.  Make sure you have called 'screen - media' first "},
    {name: "screen - camera", id: "screen-camera", method:Method.GET, url:"http://[lenovo]:9102/api/camera", params:"{}", description:"This will show live video from the camera on the caravan screen"},
    /*{name: "screen - scan", id: "screen-scan", method:Method.GET, url:"http://[lenovo]:9102/api/camera/scan", params:"{}", description:"This will place face meshes over all faces in the streamed video (make sure you have called the 'screen-camera' action first"},*/
    {name: "screen - message", id: "message", method:Method.GET, url:"http://[lenovo]:9102/api/message", params:`{"query":{"message":"a message"}}`, description:"This will flash up a message on the screen, it will overlay it on whatever is currently on there"},
    /*{name: "mini screen", id:"mini-screen", method:Method.GET, url:"http://[lenovo]:9107/api/update", params:`{"query":{"html":"<img src='https://via.placeholder.com/150'>"}}`, description:"This will send arbitrary HTML to the caravan's mini screens"},*/
]

const _lookupaction = (action:Action)=>{
    const url = (action.action || "").toString();
    const idx = actions.map(a=>a.url).indexOf(url);
    return idx === -1 ? "raw" : actions[idx].id;
}

export const AddAction: React.FC<AddActionProps> = props => {
	const {onAdd,onClose,action} = props;
	const [_action, _setAction] = React.useState<Action>(action);
    const [file, setFile] = React.useState<File>();
    const [mediaList, setMediaList] = React.useState<string[]>([]);
    const [selectedActionProfile, setSelectedActionProfile] = React.useState(_lookupaction(action));
	const {t} = useTranslation();

    React.useEffect(()=>{
        request.get("/media/list").end((err,response)=>{
            if (!err){
                const {files=[]} = response.body;
                setMediaList(files);
            }
        })
        
    },[file]);

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

    const handleActionChange = (e:React.ChangeEvent<HTMLSelectElement>)=>{
        setSelectedActionProfile(e.target.value);
        _setAction({
            ..._action,
            ...actions.reduce((acc, item)=>{
                if (item.id===e.target.value){
                    return {
                        action:item.url,
                        params:item.params,
                        method:item.method,
                        delay:0
                    }
                }
                return acc;
            },{})
        })
    }

    const description = ()=>{
        return actions.reduce((acc, item)=>{
            if (item.id===selectedActionProfile){
               return item.description;
            }
            return acc;
        },"")
    }

    const _hueparams = ()=>{
       
        const params = JSON.parse(_action.params || "{}");
        const {query={}} = params;
        const {hex="ff0000"} = query;
        return <> 
            <input type="color" id="favcolor" name="favcolor" value={`#${hex}`} onChange={(e)=>{setParams(JSON.stringify({query:{hex:e.target.value.replace("#","")}}))}}/>
            <p className="description">select a colour for the lights</p>
        </>
    }

    const _nanoparams = ()=>{
       
        const params = JSON.parse(_action.params || "{}");
        const {query={}} = params;
        const {hex="ff0000"} = query;
        return <> 
            <input type="color" id="favcolor" name="favcolor" value={`#${hex}`} onChange={(e)=>{setParams(JSON.stringify({query:{hex:e.target.value.replace("#","")}}))}}/>
            <p className="description">select a colour for the lights</p>
        </>
    }

    const _rawparams = ()=>{
        return <TextInput onChange={e => setParams(e.target.value)} helptext={`as a json object e.g {'greeting':{'hello':'world'}}`} value={_action.params||""}>params</TextInput>
    }

    const _messageparams = ()=>{
        const params = JSON.parse(_action.params || "{}");
        const {query={}} = params;
        const {message="a message"} = query;
        return <TextInput onChange={e => setParams(JSON.stringify({query:{message:e.target.value}}))} helptext={`the message you want to display`} value={message}>message</TextInput>
    }

    const onFileChange = (e:React.ChangeEvent<HTMLInputElement>)=>{
        const {files=[]} = e.target;
        if (files && files.length > 0){
            setFile(files[0]);
        }
    }

    const onFileUpload = ()=>{
        if (file){
            const formData = new FormData(); 
     
            // Update the formData object 
            formData.append( 
                "mediaFile", 
                file,
                file.name 
            ); 

            request.post("/media/upload").send(formData).end(function(err, response) {
                console.log(err, response);
                if (!err){
                    setFile(undefined);
                    setParams(JSON.stringify({query:{media:file.name}}));
                }
            });
        }
        
    }

    const _mediaparams = ()=>{

        const params = JSON.parse(_action.params || "{}");
        const {query={}} = params;
        const {media=""} = query;

        const _setMedia = (e:React.ChangeEvent<HTMLSelectElement>)=>{
            console.log("setting media", e.target.value);
           setParams(JSON.stringify({query:{media:e.target.value}}));
        }

        return  <div style={{paddingBottom:7}}>
                    <div style={{paddingTop:7,paddingBottom:15,  borderBottom:"1px solid"}}>
                        <div style={{marginTop:7,marginBottom:15, fontWeight:700}}>
                                Select from media on caravan server
                        </div>
                        <TextSelect onChange={_setMedia}  options={[{label:"",value:""},...mediaList.map(m=>({label:m, value:m}))]} value={media}>media in caravan</TextSelect>
                    </div>
                    <div style={{paddingTop:15,paddingBottom:7}}>
                        <div style={{marginTop:7, marginBottom:15, fontWeight:700}}>
                            Or upload new media
                        </div>
                        <div>
                            <input type="file" onChange={onFileChange} /> 
                        </div>
                        <div style={{marginTop:10}}>
                            {file && <IconButton
                                    disabled={false}
                                    icon={<IconUpload />}
                                    label={t('Upload this file')}
                                    onClick={onFileUpload}
                                    variant="primary"
                            />}
                        </div>
                    </div>
                   {media.trim() != "" && <div style={{textAlign:"center", borderRadius: 5, padding:10, marginTop:15, fontSize:"1em"}}><strong>play file: </strong>{`${media}`}</div>}
                </div>
    }

    //{"body":{"text":"a line of text"}}
    const _printerparams = ()=>{
        const params = JSON.parse(_action.params || "{}");
        const {body={}} = params;
        const {text="a line to print"} = body;
        return <TextInput onChange={e => setParams(JSON.stringify({body:{text:e.target.value}}))} helptext={`the message you want to display`} value={text}>line to print</TextInput>
    }

    const _speechparams = ()=>{
        
        //FIX!!
        const params = JSON.parse(_action.params || "{}");
        const {body={}} = params;
        const {speech=[]} = body;
        return <AddSpeech lines={speech} onAdd={(lines)=>{setParams(JSON.stringify({body:{speech:lines}}))}}/>
    }


    const _fanparams = ()=>{
        const params = JSON.parse(_action.params || "{}");
        const {query={}} = params;
        const {rotate=true, power=10, cool=true, from=0, to=90} = query;
        
        const _handleRotateChange = (e:React.ChangeEvent<HTMLSelectElement>)=>{
            setParams(JSON.stringify({query:{rotate:e.target.value==="true" ? true : false, power, cool, from, to}}));
        }

        const _handlePowerChange = (e:React.ChangeEvent<HTMLSelectElement>)=>{
            setParams(JSON.stringify({query:{rotate, power:Number(e.target.value), cool, from, to}}));
        }

        const _handleTempChange = (e:React.ChangeEvent<HTMLSelectElement>)=>{
            setParams(JSON.stringify({query:{rotate, cool:e.target.value==="true" ? true : false, power, from, to}}));
        }

        const _handleFromChange = (e:React.ChangeEvent<HTMLInputElement>)=>{
            if (!isNaN(Number(e.target.value))){
                setParams(JSON.stringify({query:{rotate, cool, power, from:Number(e.target.value), to}}));
            }
        }

        const _handleToChange = (e:React.ChangeEvent<HTMLInputElement>)=>{
            if (!isNaN(Number(e.target.value))){
                setParams(JSON.stringify({query:{rotate, cool, power, to:Number(e.target.value), from}}));
            }
        }

        const powerlabels = [0,1,2,3,4,5,6,7,8,9,10].map(i=>({label:`${i}`, value:`${i}`}))


        return  <div style={{display:"flex", flexDirection:"column"}}>
                    <div className="formItem">
                        <TextSelect onChange={_handleRotateChange}  options={[{label:"true", value:"true"}, {label:"false", value:"false"}]} value={rotate ? "true": "false"}>rotate</TextSelect>
                    </div>
                    <div className="formItem">
                        <TextSelect onChange={_handlePowerChange}  options={powerlabels} value={power}>power</TextSelect>
                    </div>
                    <div className="formItem">
                        <TextSelect onChange={_handleTempChange} options={[{label:"true", value:"true"}, {label:"false", value:"false"}]} value={cool ? "true": "false"}>cool</TextSelect>
                    </div>
                    <div className="formItem">
                        <TextInput onChange={_handleFromChange} helptext={`rotation from (deg)`} value={from}>rotation from</TextInput>
                    </div>
                    <div className="formItem">
                        <TextInput onChange={_handleToChange} helptext={`rotation to (deg)`} value={to}>rotation to</TextInput>
                    </div>
                </div>
    }

    const renderParams = ()=>{
       
        switch (selectedActionProfile){
            case "screen-media-play":
                return _mediaparams();
            case "nanoleaf":
                return _nanoparams();
            case "huecolour":
                return _hueparams();
            case "raw":
                return _rawparams();
            case "message": // message on screen!
                return _messageparams();
            case "printline": // send to label printer
                return _printerparams();
            case "fan":
                return _fanparams();
            case "speech":    
                return _speechparams();
            default:
                return;

        }
    }

    const renderMethod = ()=>{
        if (selectedActionProfile == "raw"){
            return <TextSelect onChange={handleMethodChange} options={[
                {disabled:false, label:"GET", value:Method.GET},
                {disabled:false, label:"POST", value:Method.POST}
                ]} value={_action.method === Method.POST ? Method.POST : Method.GET}>
                {"method"}
            </TextSelect>
        }
    }

    const renderURL = ()=>{
        if (selectedActionProfile === "raw"){
            return <TextInput onChange={e => setAction(e.target.value)} value={_action.action.toString()} helptext={'a url or a tag!'}>url</TextInput>
        }
    }

    return (<div className="add-dialogue">
                <div className="heading">add action</div>
                <div className="formItem">
                    <TextSelect onChange={handleActionChange} options={actions.map(a => ({ label: a.name, value: a.id }))} value={selectedActionProfile}>{"action profiles"}</TextSelect>
                </div>
                <div className="description">
                    {description()}
                </div>
                <div className="formItem">
                    {renderURL()}
                </div>
                <div className="formItem">
                    {renderMethod()}
                </div>
                <div className="formItem">
                    {renderParams()}
                </div>
                <div className="formItem">
                    <TextInput style={{width:60}} onChange={e => setDelay(e.target.value)} helptext={`pause in ms BEFORE action fires`} value={`${_action.delay||0}`}>delay</TextInput>
                </div>
                <div style={{textAlign:"center"}}>
                <IconButton icon={<IconCheck />} iconOnly={true} label={""} onClick={()=>onAdd(_format(_action))} variant="primary"/> 
                <IconButton icon={<IconTrashX />} iconOnly={true} label={""} onClick={onClose} variant="primary"/> 
                </div>
            </div>)

};
