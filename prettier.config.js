// https://prettier.io/docs/en/options.html
module.exports = {
	useTabs: true, // use tabs - we can change tab widths in-editor as needed for clarity
	tabWidth: 4,
	trailingComma: 'es5', // use trailing commas when valid in es5
	semi: false, // no semicolons
	singleQuote: true, // single quotes
	bracketSpacing: true, // spaces inside { x }
	endOfLine: 'crlf', // windows line return
	arrowParens: 'always', // always parens (x) =>
	files: ['*.js', '*.jsx', '*.ts', '*.tsx', '*.scss', '*.html'],

	// jsx
	jsxSingleQuote: false, // use double quotes in jsx
	jsxBracketSameLine: false, // jsx final bracket on new line
	quoteProps: 'as-needed',
	printWidth: 100,
}
