import * as React from 'react';
import classNames from 'classnames';
import './icon-button-link.css';

export interface IconButtonProps {
	buttonType?: 'button' | 'submit';
	disabled?: boolean;
	icon: React.ReactNode;
	iconOnly?: boolean;
	iconPosition?: 'start' | 'end';
	label: string;
	onClick?: (e: React.MouseEvent) => void;
	preventDefault?: boolean;
	variant?: 'create' | 'danger' | 'primary' | 'secondary';
	style?: object;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
	(props, ref) => {
		const {
			disabled,
			icon,
			iconOnly,
			iconPosition = 'start',
			onClick,
			preventDefault,
			variant = 'secondary',
			style={}
		} = props;

		const className = classNames(
			'icon-button',
			`icon-position-${iconPosition}`,
			`variant-${variant}`,
			{'icon-only': iconOnly}
		);

		const handleOnClick = (e: React.MouseEvent) => {
			onClick && onClick(e);

			if (preventDefault) {
				e.preventDefault();
			}
		};

		return (
			<button
				aria-label={iconOnly ? props.label : undefined}
				disabled={disabled}
				className={className}
				onClick={handleOnClick}
				ref={ref}
				style={style}
			>
				<span className="icon">{icon}</span>
				{!iconOnly && props.label}
			</button>
		);
	}
);
