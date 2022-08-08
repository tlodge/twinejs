import * as React from 'react';
import {composeInitialProps, useTranslation} from 'react-i18next';
import {IconResize} from '@tabler/icons';
import {UndoRedoButtons} from '../../components/codemirror/undo-redo-buttons';
import {ButtonBar} from '../../components/container/button-bar';
import {
	DialogCard,
	DialogCardProps
} from '../../components/container/dialog-card';
import {CheckboxButton} from '../../components/control/checkbox-button';
import {MenuButton} from '../../components/control/menu-button';
import {AddTagButton, TagButton} from '../../components/tag';
import { AddRulesButton } from '../../components/rules/add-rules-button';
import { ChooseTypeButton } from '../../components/choosetype/choose-type-button';
import {
	formatWithNameAndVersion,
	useStoryFormatsContext
} from '../../store/story-formats';
import {
	addPassageTag,
	passageWithId,
	removePassageTag,
	setTagColor,
	storyPassageTags,
	storyWithId,
	updatePassage,
	updateStory
} from '../../store/stories';
import {useUndoableStoriesContext} from '../../store/undoable-stories';
import {Color} from '../../util/color';
import {PassageText} from './passage-text';
import {RenamePassageButton} from '../../components/passage/rename-passage-button';
import './passage-edit.css';
import { AddOnStartButton } from '../../components/onstart';
import { AddSpeech, Speech } from '../../components/onstart/add-speech';
import { Rule } from '../../components/rules/add-button-rules';

import {convertToObject, convertToString} from '../../util/caravan';
import { Action } from '../../components/onstart/add-actions';
import { TextSelect } from '../../components/control/text-select';
import { useDialogsContext } from '../context';


export interface PassageEditDialogProps
	extends Omit<DialogCardProps, 'headerLabel'> {
	passageId: string;
	storyId: string;
}


export const InnerPassageEditDialog: React.FC<PassageEditDialogProps> = props => {

	const {passageId, storyId, ...other} = props;
	const [cmEditor, setCmEditor] = React.useState<CodeMirror.Editor>();
	const {dispatch, stories} = useUndoableStoriesContext();
	const {formats} = useStoryFormatsContext();
	const passage = passageWithId(stories, storyId, passageId);
	const story = storyWithId(stories, storyId);
	
	console.log("passage is....");
	console.log(passage.text);
	console.log("------");

	const storyFormat = formatWithNameAndVersion(
		formats,
		story.storyFormat,
		story.storyFormatVersion
	);
	const {t} = useTranslation();

	const handlePassageTextChange = React.useCallback(
		
		(text: string) => {
			dispatch(updatePassage(story, passage, {text}));
		},
		[dispatch, passage, story]
	);

	const handleAddStart = React.useCallback((actions:Action[][])=>{

		console.log("---> am in handle add start with actions");
		console.log("*******");
		console.log(actions);
		console.log("*******");
		//get the current text and turn into a node object
		const passageobj = convertToObject(passage.text);

		//set the new text using a passage object modified with speech lines
		const passagetext = convertToString({...passageobj, onstart:{...passageobj.onstart, actions}});
		
		//update the passage object
		dispatch(updatePassage(story, passage, {text: passagetext}));

	},[dispatch, passage, story]);
	// TODO: make tag changes undoable

	function handleAddTag(name: string, color?: Color) {
		dispatch(addPassageTag(story, passage, name));

		if (color) {
			dispatch(setTagColor(story, name, color));
		}
	}

	function handleChangeTagColor(name: string, color: Color) {
		dispatch(
			updateStory(stories, story, {
				tagColors: {...story.tagColors, [name]: color}
			})
		);
	}

	function handleRemoveTag(name: string) {
		dispatch(removePassageTag(story, passage, name), t('undoChange.removeTag'));
	}

	function handleRename(name: string) {
		// Don't create newly linked passages here because the update action will
		// try to recreate the passage as it's been renamed--it sees new links in
		// existing passages, updates them, but does not see that the passage name
		// has been updated since that hasn't happened yet.

		dispatch(
			updatePassage(
				story,
				passage,
				{name},
				{dontCreateNewlyLinkedPassages: true}
			)
		);
	}

	function handleSetAsStart() {
		dispatch(updateStory(stories, story, {startPassage: passageId}));
	}

	function handleSetSize({height, width}: {height: number; width: number}) {
		dispatch(updatePassage(story, passage, {height, width}));
	}

	const isStart = story.startPassage === passage.id;
	const node = convertToObject(passage.text);

	const {actions = []} = (node.onstart || {})
	console.log("node actions", actions);

	return (
		<DialogCard
			{...other}
			className="passage-edit-dialog"
			headerLabel={passage.name}
		>
			<ButtonBar>
				<UndoRedoButtons editor={cmEditor} watch={passage.text} />
				<AddOnStartButton
					actions={actions}
					onAdd={handleAddStart}
					onClose={()=>{console.log("closed!")}}
					label={"on start"}
				/>
				<AddRulesButton
					rules={node.rules}
					type={node.type}
					label="rules"
					onAdd={(rules:Rule[])=>{
						const passageobj = {...node}
						const _updated = {
							...passageobj,
							rules /*: [...passageobj.rules, ...rules]*/
						}
						
						
						const passagetext = convertToString(_updated);
						dispatch(updatePassage(story, passage, {text: passagetext}));
					}}
					onSelect={(type)=>{
						
						const _node = {
							...node,
							type
						}
						//THIS IS THE BIT THAT ADDS /t/n!!
						const passagetext = convertToString(_node);
						
						console.log(passagetext);

						dispatch(updatePassage(story, passage, {text: passagetext}));
					}}
				/>		
				
				{/*<MenuButton
					icon={<IconResize />}
					items={[
						{
							checkable: true,
							checked: passage.height === 100 && passage.width === 100,
							label: t('dialogs.passageEdit.sizeSmall'),
							onClick: () => handleSetSize({height: 100, width: 100})
						},
						{
							checkable: true,
							checked: passage.height === 200 && passage.width === 200,
							label: t('dialogs.passageEdit.sizeLarge'),
							onClick: () => handleSetSize({height: 200, width: 200})
						},
						{
							checkable: true,
							checked: passage.height === 200 && passage.width === 100,
							label: t('dialogs.passageEdit.sizeTall'),
							onClick: () => handleSetSize({height: 200, width: 100})
						},
						{
							checkable: true,
							checked: passage.height === 100 && passage.width === 200,
							label: t('dialogs.passageEdit.sizeWide'),
							onClick: () => handleSetSize({height: 100, width: 200})
						}
					]}
					label={t('dialogs.passageEdit.size')}
				/>*/}
				<RenamePassageButton
					onRename={handleRename}
					passage={passage}
					story={story}
				/>
				<CheckboxButton
					disabled={isStart}
					label={t('dialogs.passageEdit.setAsStart')}
					onChange={handleSetAsStart}
					value={isStart}
				/>
			</ButtonBar>
			{passage.tags.length > 0 && (
				<div className="tags">
					<ButtonBar>
						{passage.tags.map(tag => (
							<TagButton
								color={story.tagColors[tag]}
								key={tag}
								name={tag}
								onChangeColor={color => handleChangeTagColor(tag, color)}
								onRemove={() => handleRemoveTag(tag)}
							/>
						))}
					</ButtonBar>
				</div>
			)}
			<PassageText
				onChange={handlePassageTextChange}
				onEditorChange={setCmEditor}
				passage={passage}
				storyFormat={storyFormat}
			/>
		</DialogCard>
	);
};

export const PassageEditDialog: React.FC<PassageEditDialogProps> = props => {
	// Check for the existence of the passage. If it doesn't (e.g. it was deleted
	// after the dialog was opened), render nothing and call onClose.

	const {stories} = useUndoableStoriesContext();

	try {
		passageWithId(stories, props.storyId, props.passageId);
	} catch (err) {
		console.log("ERROR", err);
		console.log("I AM CLOSED NOE!!");
		props.onClose();
		return null;
	}

	return <InnerPassageEditDialog {...props} />;
};