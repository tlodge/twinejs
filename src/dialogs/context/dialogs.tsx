import * as React from 'react';
import {useScrollbarSize} from 'react-scrollbar-size';
import {CSSTransition, TransitionGroup} from 'react-transition-group';
import {useDialogsContext} from '.';
import './dialogs.css';

const DialogTransition: React.FC = props => (
	<CSSTransition classNames="pop" timeout={200} {...props}>
		{props.children}
	</CSSTransition>
);

export const Dialogs: React.FC = () => {
	const {height, width} = useScrollbarSize();
	const {dispatch, dialogs} = useDialogsContext();

	const style: React.CSSProperties = {
		marginBottom: height,
		marginRight: width
	};

	return (
		<div className="dialogs" style={style}>
			<TransitionGroup component={null}>
				{dialogs.map((dialog, index) => {
					const managementProps = {
						collapsed: dialog.collapsed,
						onChangeCollapsed: (collapsed: boolean) =>
							dispatch({type: 'setDialogCollapsed', collapsed, index}),
						onClose: () => {
							dispatch({type: 'removeDialog', index})
							console.log("removed dialogue!!");
						}
					};

					return (
						<DialogTransition key={index}>
							<dialog.component {...dialog.props} {...managementProps} />
						</DialogTransition>
					);
				})}
			</TransitionGroup>
		</div>
	);
};
