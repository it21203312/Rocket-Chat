import { expect } from 'chai';
import proxyquire from 'proxyquire';
import sinon from 'sinon';

// Create stubs for dependencies
const stubs = {
	findOneUserById: sinon.stub(),
	randomId: sinon.stub(),
	stat: sinon.stub(),
	getStore: sinon.stub(),
	insertFileStub: sinon.stub(),
	createReadStream: sinon.stub(),
};

const { uploadZipFile } = proxyquire.noCallThru().load('./uploadZipFile.ts', {
	'@rocket.chat/models': {
		Users: {
			findOneById: stubs.findOneUserById,
		},
	},
	'@rocket.chat/random': {
		Random: {
			id: stubs.randomId,
		},
	},
	'fs/promises': {
		stat: stubs.stat,
	},
	'fs': {
		createReadStream: stubs.createReadStream,
	},
	'../../../app/file-upload/server': {
		FileUpload: {
			getStore: stubs.getStore,
		},
	},
});

describe('Export - uploadZipFile', () => {
	const randomId = 'random-id';
	const fileStat = 100;
	const userName = 'John Doe';
	const userId = 'user-id';
	const filePath = 'random-path';

	beforeAll(() => {
		stubs.findOneUserById.returns({ name: userName });
		stubs.stat.returns(fileStat);
		stubs.randomId.returns(randomId);
		stubs.getStore.returns({ insert: stubs.insertFileStub });
		stubs.insertFileStub.callsFake((details) => ({ _id: details._id, name: details.name }));
	});

	it('should correctly build file name for json exports', async () => {
		const result = await uploadZipFile(filePath, userId, 'json');

		expect(stubs.findOneUserById.calledWith(userId)).to.be.true;
		expect(stubs.stat.calledWith(filePath)).to.be.true;
		expect(stubs.createReadStream.calledWith(filePath)).to.be.true;
		expect(stubs.getStore.calledWith('UserDataFiles')).to.be.true;
		expect(
			stubs.insertFileStub.calledWith(
				sinon.match({
					_id: randomId,
					userId,
					type: 'application/zip',
					size: fileStat,
				}),
			),
		).to.be.true;

		expect(result).to.have.property('_id', randomId);
		expect(result).to.have.property('name').that.is.a.string;
		const fileName: string = result.name;
		expect(fileName.endsWith(`${userId}-data-${randomId}.zip`));
	});

	it('should correctly build file name for html exports', async () => {
		const result = await uploadZipFile(filePath, userId, 'html');

		expect(stubs.findOneUserById.calledWith(userId)).to.be.true;
		expect(stubs.stat.calledWith(filePath)).to.be.true;
		expect(stubs.createReadStream.calledWith(filePath)).to.be.true;
		expect(stubs.getStore.calledWith('UserDataFiles')).to.be.true;
		expect(
			stubs.insertFileStub.calledWith(
				sinon.match({
					_id: randomId,
					userId,
					type: 'application/zip',
					size: fileStat,
				}),
			),
		).to.be.true;

		expect(result).to.have.property('_id', randomId);
		expect(result).to.have.property('name').that.is.a.string;
		const fileName: string = result.name;
		expect(fileName.endsWith(`${userId}-${randomId}.zip`));
	});
});
