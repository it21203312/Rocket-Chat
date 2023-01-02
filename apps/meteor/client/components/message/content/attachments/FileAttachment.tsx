import type { FileAttachmentProps } from '@rocket.chat/core-typings';
import { isFileAudioAttachment, isFileImageAttachment, isFileVideoAttachment } from '@rocket.chat/core-typings';
import type { FC } from 'react';
import React from 'react';

import { AudioAttachment } from './file/AudioAttachment';
import type { GenericFileAttachmentProps } from './file/GenericFileAttachment';
import { GenericFileAttachment } from './file/GenericFileAttachment';
import { ImageAttachment } from './file/ImageAttachment';
import { VideoAttachment } from './file/VideoAttachment';

export const FileAttachment: FC<FileAttachmentProps> = (attachment) => {
	if (isFileImageAttachment(attachment)) {
		return <ImageAttachment {...attachment} />;
	}
	if (isFileAudioAttachment(attachment)) {
		return <AudioAttachment {...attachment} />;
	}
	if (isFileVideoAttachment(attachment)) {
		return <VideoAttachment {...attachment} />;
	}
	// if (isFilePDFAttachment(attachment)) { return <PDFAttachment {...attachment} />; }

	return <GenericFileAttachment {...(attachment as GenericFileAttachmentProps)} />;
};

export { GenericFileAttachment, ImageAttachment, VideoAttachment };
