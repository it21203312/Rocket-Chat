---
to: packages/<%= name %>/tsconfig.json
---
{
	"extends": "../../tsconfig.base.client.json",
	"compilerOptions": {
		"rootDir": "./src",
		"outDir": "./dist"
	},
	"include": ["./src/**/*"]
}
