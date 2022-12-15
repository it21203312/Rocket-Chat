---
to: ee/apps/<%= name %>/tsconfig.json
---
{
	"extends": "../../../tsconfig.base.json",
	"compilerOptions": {
		"outDir": "./dist",
		"declaration": false,
		"declarationMap": false
	},
	"files": ["./src/service.ts"],
	"include": ["../../../apps/meteor/definition/externals/meteor"],
	"exclude": ["./dist"]
}
