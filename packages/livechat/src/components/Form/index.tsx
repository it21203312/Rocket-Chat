import i18next from 'i18next';
import type { ComponentChildren } from 'preact';
import type { JSXInternal } from 'preact/src/jsx';

import { validateEmail } from '../../lib/email';
import { createClassName, MemoizedComponent } from '../helpers';
import styles from './styles.scss';

type FormProps = {
	onSubmit: (event: Event) => void;
	className?: string;
	style?: JSXInternal.CSSProperties;
	id?: string;
	children: ComponentChildren;
};

export class Form extends MemoizedComponent {
	render = ({ onSubmit, className, style = {}, id, children }: FormProps) => (
		<form noValidate id={id} onSubmit={onSubmit} className={createClassName(styles, 'form', {}, [className])} style={style}>
			{children}
		</form>
	);
}

export const Validations = {
	nonEmpty: ({ value }: { value: string }) => (!value.trim() ? i18next.t('field_required') : undefined),
	email: ({ value }: { value: string }) =>
		validateEmail(String(value).toLowerCase(), { style: 'rfc' }) ? null : i18next.t('invalid_email'),
	custom: ({ value, pattern }: { value: string; pattern: string }) =>
		new RegExp(pattern, 'i').test(String(value)) ? null : i18next.t('invalid_value'),
};

export { FormField } from './FormField';
export { TextInput } from './TextInput';
export { MultilineTextInput } from './MultilineTextInput';
export { PasswordInput } from './PasswordInput';
export { SelectInput } from './SelectInput';
export { CustomFields } from './CustomFields';
