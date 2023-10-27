import type { ILivechatCustomField } from '@rocket.chat/core-typings';
import type { SelectOption } from '@rocket.chat/fuselage';
import {
	FieldError,
	Box,
	Button,
	ButtonGroup,
	Field,
	FieldGroup,
	FieldLabel,
	FieldRow,
	Select,
	TextInput,
	ToggleSwitch,
} from '@rocket.chat/fuselage';
import { useMutableCallback, useUniqueId } from '@rocket.chat/fuselage-hooks';
import { useToastMessageDispatch, useMethod, useTranslation, useRouter } from '@rocket.chat/ui-contexts';
import { useQueryClient } from '@tanstack/react-query';
import React, { useMemo } from 'react';
import { FormProvider, useForm, Controller } from 'react-hook-form';

import {
	Contextualbar,
	ContextualbarTitle,
	ContextualbarHeader,
	ContextualbarClose,
	ContextualbarFooter,
	ContextualbarScrollableContent,
} from '../../../components/Contextualbar';
import { useFormsSubscription } from '../additionalForms';
import { useRemoveCustomField } from './useRemoveCustomField';

const getInitialValues = (customFieldData: ILivechatCustomField | undefined) => ({
	field: customFieldData?._id || '',
	label: customFieldData?.label || '',
	scope: customFieldData?.scope || 'visitor',
	visibility: customFieldData?.visibility === 'visible',
	searchable: !!customFieldData?.searchable,
	regexp: customFieldData?.regexp || '',
	// additional props
	type: customFieldData?.type || 'input',
	required: !!customFieldData?.required,
	defaultValue: customFieldData?.defaultValue || '',
	options: customFieldData?.options || '',
	public: !!customFieldData?.public,
});

const EditCustomFields = ({ customFieldData }: { customFieldData?: ILivechatCustomField }) => {
	const t = useTranslation();
	const router = useRouter();
	const queryClient = useQueryClient();
	const dispatchToastMessage = useToastMessageDispatch();

	const { useCustomFieldsAdditionalForm } = useFormsSubscription();
	const AdditionalForm = useCustomFieldsAdditionalForm();

	const handleDelete = useRemoveCustomField();

	const methods = useForm({ mode: 'onBlur', values: getInitialValues(customFieldData) });
	const {
		control,
		handleSubmit,
		formState: { isDirty, errors },
	} = methods;

	const saveCustomField = useMethod('livechat:saveCustomField');

	const handleSave = useMutableCallback(async ({ visibility, ...data }) => {
		try {
			await saveCustomField(customFieldData?._id as unknown as string, {
				visibility: visibility ? 'visible' : 'hidden',
				...data,
			});

			dispatchToastMessage({ type: 'success', message: t('Saved') });
			queryClient.invalidateQueries(['livechat-customFields']);
			router.navigate('/omnichannel/customfields');
		} catch (error) {
			dispatchToastMessage({ type: 'error', message: error });
		}
	});

	const scopeOptions: SelectOption[] = useMemo(
		() => [
			['visitor', t('Visitor')],
			['room', t('Room')],
		],
		[t],
	);

	const formId = useUniqueId();
	const fieldField = useUniqueId();
	const labelField = useUniqueId();
	const scopeField = useUniqueId();
	const visibilityField = useUniqueId();
	const searchableField = useUniqueId();
	const regexpField = useUniqueId();

	return (
		<Contextualbar>
			<ContextualbarHeader>
				<ContextualbarTitle>{customFieldData?._id ? t('Edit_Custom_Field') : t('New_Custom_Field')}</ContextualbarTitle>
				<ContextualbarClose onClick={() => router.navigate('/omnichannel/customfields')} />
			</ContextualbarHeader>
			<ContextualbarScrollableContent>
				<FormProvider {...methods}>
					<form id={formId} onSubmit={handleSubmit(handleSave)}>
						<FieldGroup>
							<Field>
								<FieldLabel htmlFor={fieldField} required>
									{t('Field')}
								</FieldLabel>
								<FieldRow>
									<Controller
										name='field'
										control={control}
										rules={{ required: t('The_field_is_required', t('Field')) }}
										render={({ field }) => (
											<TextInput
												id={fieldField}
												{...field}
												readOnly={Boolean(customFieldData?._id)}
												aria-required={true}
												aria-invalid={Boolean(errors.field)}
												aria-describedby={`${fieldField}-error`}
											/>
										)}
									/>
								</FieldRow>
								{errors?.field && (
									<FieldError aria-live='assertive' id={`${fieldField}-error`}>
										{errors.field.message}
									</FieldError>
								)}
							</Field>
							<Field>
								<FieldLabel htmlFor={labelField} required>
									{t('Label')}
								</FieldLabel>
								<FieldRow>
									<Controller
										name='label'
										control={control}
										rules={{ required: t('The_field_is_required', t('Label')) }}
										render={({ field }) => (
											<TextInput
												id={labelField}
												{...field}
												aria-required={true}
												aria-invalid={Boolean(errors.label)}
												aria-describedby={`${labelField}-error`}
											/>
										)}
									/>
								</FieldRow>
								{errors?.label && (
									<FieldError aria-live='assertive' id={`${labelField}-error`}>
										{errors.label.message}
									</FieldError>
								)}
							</Field>
							<Field>
								<FieldLabel htmlFor={scopeField}>{t('Scope')}</FieldLabel>
								<FieldRow>
									<Controller
										name='scope'
										control={control}
										render={({ field }) => <Select id={scopeField} {...field} options={scopeOptions} />}
									/>
								</FieldRow>
							</Field>
							<Field>
								<Box display='flex' flexDirection='row'>
									<FieldLabel htmlFor={visibilityField}>{t('Visible')}</FieldLabel>
									<FieldRow>
										<Controller
											name='visibility'
											control={control}
											render={({ field: { value, ...field } }) => <ToggleSwitch id={visibilityField} {...field} checked={value} />}
										/>
									</FieldRow>
								</Box>
							</Field>
							<Field>
								<Box display='flex' flexDirection='row'>
									<FieldLabel htmlFor={searchableField}>{t('Searchable')}</FieldLabel>
									<FieldRow>
										<Controller
											name='searchable'
											control={control}
											render={({ field: { value, ...field } }) => <ToggleSwitch id={searchableField} {...field} checked={value} />}
										/>
									</FieldRow>
								</Box>
							</Field>
							<Field>
								<FieldLabel htmlFor={regexpField}>{t('Validation')}</FieldLabel>
								<FieldRow>
									<Controller name='regexp' control={control} render={({ field }) => <TextInput id={regexpField} {...field} />} />
								</FieldRow>
							</Field>
							{AdditionalForm && <AdditionalForm />}
						</FieldGroup>
					</form>
				</FormProvider>
			</ContextualbarScrollableContent>
			<ContextualbarFooter>
				<ButtonGroup stretch>
					<Button onClick={() => router.navigate('/omnichannel/customfields')}>{t('Cancel')}</Button>
					<Button form={formId} data-qa-id='BtnSaveEditCustomFieldsPage' primary type='submit' disabled={!isDirty}>
						{t('Save')}
					</Button>
				</ButtonGroup>
				{customFieldData?._id && (
					<ButtonGroup stretch mbs={8}>
						<Button icon='trash' danger onClick={() => handleDelete(customFieldData._id)}>
							{t('Delete')}
						</Button>
					</ButtonGroup>
				)}
			</ContextualbarFooter>
		</Contextualbar>
	);
};

export default EditCustomFields;
