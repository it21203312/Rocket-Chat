/* eslint-disable */

// node --experimental-modules generateEmojiIndex.mjs
import fs from 'fs';
import https from 'https';
import nsg from 'node-sprite-generator';
import _ from 'underscore';
import gm from 'gm';

const assetFolder = '../../../node_modules/emojione-assets';
const emojiJsonFile = `${ assetFolder }/emoji.json`;

if (!fs.existsSync(emojiJsonFile)) {
	console.error(`${ emojiJsonFile } doesn't exist.`);
	console.error('Maybe you need to run \'meteor npm install emojione-assets\' or \'meteor npm install\'?');
} else {
	const emojiJson = fs.readFileSync(emojiJsonFile);
	generateEmojiPicker(emojiJson);
}

function generateEmojiPicker(data) {
	const emojiList = JSON.parse(data);
	console.log(`${Object.keys(emojiList).length} emojis found.`);

	let toneList = [];
	let emojisByCategory = {};

	for (let emoji in emojiList) {
		if (emojiList.hasOwnProperty(emoji)) {
			if (emojiList[emoji].shortname) {
				const toneIndex = emojiList[emoji].shortname.indexOf('_tone');
				if (toneIndex !== -1) {
					const tone = emojiList[emoji].shortname.substr(1, toneIndex - 1);
					if (!toneList.includes(tone)) {
						toneList.push(tone);
					}
					continue;
				}
			}

			if (!emojisByCategory[emojiList[emoji].category]) {
				emojisByCategory[emojiList[emoji].category] = [];
			}
			emojisByCategory[emojiList[emoji].category].push(emoji);
		}
	}

	let output = `/*
 * This file is automatically generated from generateEmojiIndex.mjs
 * Last generated ${Date().toString()}
 *
 * Mapping category hashes into human readable and translated names
 */\n\n`;


	const emojiCategoriesMapping = {
		people: 'Smileys_and_People',
		nature: 'Animals_and_Nature',
		food: 'Food_and_Drink',
		activity: 'Activity',
		travel: 'Travel_and_Places',
		objects: 'Objects',
		symbols: 'Symbols',
		flags: 'Flags',
		regional: 'Regional',
		modifier: 'Modifier'
	};

	// emojiCategories
	output += `export const emojiCategories = {\n`;
	for (let category in emojisByCategory) {
		if (emojiCategoriesMapping[category]) {
			output += `\t${category}: '${emojiCategoriesMapping[category]}',\n`;
		} else {
			console.error(`No emojiCategory mapping for ${category}`);
		}
	}
	output += `};\n`;

	// toneList
	const needsQuotes = ['-'];
	output += `export const toneList = {\n`;
	for (let tone in toneList) {
		if (toneList[tone].includes(needsQuotes)) {
			output += `\t'${toneList[tone]}': 1,\n`;
		} else {
			output += `\t${toneList[tone]}: 1,\n`;
		}

	}
	output += `};\n`;

	// emojisByCategory
	output += `export const emojisByCategory = {\n`;
	for (let category in emojisByCategory) {
		output += `\t${category}: [\n`;

		for (let emoji in emojisByCategory[category]) {
			output += `\t\t'${emojiList[emojisByCategory[category][emoji]].shortname.replace(/:/g,'')}',\n`;
		}

		output += `\t],\n`;
	}
	output += `};\n`;

	fs.writeFileSync("emojiPicker.js", output, {
		encoding: 'utf8',
		flag: 'w'
	});
	console.log('Generated emojiPicker.js!');

	console.log('Generating sprite sheets....');

	let spriteCss = '';

	for (let category in emojisByCategory) {
		let srcList = [];
		const emojis = _.filter(emojiList, x => x.category === category);
		const spritePath = `../../../public/packages/emojione/assets/sprites/${ category }-sprites.png`;
		_.each(emojis, function (emoji) {
			srcList.push(`${ assetFolder }/png/64/${ emoji.code_points.base }.png`);
		});
		spriteCss += `@import './${ category }-sprites.css';\n`;

		nsg({
			src: srcList,
			spritePath: spritePath,
			layout: 'packed',
			stylesheet: 'emojione.tpl',
			stylesheetPath: `../client/${ category }-sprites.css`,
			compositor: 'gm',
			layoutOptions: {
				scaling: 1,
			},
			stylesheetOptions: {
				prefix: '',
				category: category,
				spritePath: `/packages/emojione/assets/sprites/${ category }-sprites.png`,
				pixelRatio: 1
			}
		}, function (err) {
			if (err) {
				console.error(err);
				return;
			}
			console.log(`${ category }'s sprite generated!`);
		});
	}

	spriteCss += `.emojione {
	position: relative;

	display: inline-block;
	overflow: hidden;

	width: 22px;
	height: 22px;
	margin: 0 0.15em;

	vertical-align: middle;
	white-space: nowrap;
	text-indent: 100%;
	font-size: inherit;
	line-height: normal;
	image-rendering: -webkit-optimize-contrast;
	image-rendering: optimizeQuality;
}
.emojione.big {
	width: 44px;
	height: 44px;
}
`;
	fs.writeFileSync("../client/emojione-sprites.css", spriteCss, {
		encoding: 'utf8',
		flag: 'w'
	});
}
