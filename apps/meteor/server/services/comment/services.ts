import { Cursor } from 'mongodb';

import { ServiceClassInternal } from '../../sdk/types/ServiceClass';
import { ICommentService, ICommentCreateParams, IComment, ICommentUpdateBody, ICommentUpdateParams } from '../../../definition/IComment';
import { IPaginationOptions, IQueryOptions } from '../../../definition/ITeam';
import { CreateObject } from '../../../definition/ICreate';
import { UpdateObject } from '../../../definition/IUpdate';
import { InsertionModel } from '../../../app/models/server/raw/BaseRaw';
import { CommentModel } from '../../../app/models/server/raw';
import { CommentsRaw } from '../../../app/models/server/raw/Comments';

export class CommentService extends ServiceClassInternal implements ICommentService {
	protected name = 'comment';

	private CommentModel: CommentsRaw = CommentModel;

	async create(params: ICommentCreateParams): Promise<IComment> {
		const createData: InsertionModel<IComment> = {
			...new CreateObject(),
			...params,
		};
		const result = await CommentModel.insertOne(createData);
		return CommentModel.findOneById(result.insertedId);
	}

	async delete(commentId: string): Promise<void> {
		await this.getComment(commentId);
		await CommentModel.removeById(commentId);
	}

	async getComment(commentId: string): Promise<IComment> {
		const comment = await CommentModel.findOneById(commentId);
		if (!comment) {
			throw new Error('comment-does-not-exist');
		}
		return comment;
	}

	async update(commentId: string, params: ICommentUpdateParams): Promise<IComment> {
		await this.getComment(commentId);
		const query = {
			_id: commentId,
		};
		const updateData: ICommentUpdateBody = {
			...new UpdateObject(),
			...params,
		};
		const result = await CommentModel.updateOne(query, { $set: updateData });
		return CommentModel.findOneById(commentId);
	}

	list(
		{ offset, count }: IPaginationOptions = { offset: 0, count: 50 },
		{ sort, query }: IQueryOptions<IComment> = { sort: {} },
	): Cursor<IComment> {
		return CommentModel.find(
			{ ...query },
			{
				...(sort && { sort }),
				limit: count,
				skip: offset,
			},
		);
	}
}
