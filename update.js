const fs = require('fs');
const { version } = require('os');
const path = require('path');

const DATA = JSON.parse(fs.readFileSync(path.join(__dirname, 'data.json'), 'utf8'));

const LINKS = {};

const TABLE = [
	'| Repository | Status | Package |',
	'| --- | --- | --- |',
	...DATA.map((row, index) => {
		let packageVersion = '';

		if (row.npm) {
			const u = new URL('https://img.shields.io/badge/dynamic/json');
			u.searchParams.set('url', `https://registry.npmjs.org/${row.npm}/latest`);
			u.searchParams.set('query', 'version');
			u.searchParams.set('label', 'npm package');
			u.searchParams.set('labelColor', '#696969');
			u.searchParams.set('color', row.color || "lightgreen");

			u.search = u.searchParams.toString();

			packageVersion = `[![badge-${index}]][npm-${index}]`;

			LINKS[`badge-${index}`] = u.toString();
			LINKS[`npm-${index}`] = `https://www.npmjs.com/package/${row.npm}`;
		} else if (row.badge) {
			const u = new URL('https://img.shields.io/badge/dynamic/json');
			u.searchParams.set('labelColor', '#696969');
			u.searchParams.set('color', row.color || "lightgreen");
			
			for (const k in row.badge) {
				if (Object.hasOwn(row.badge, k)) {
					u.searchParams.set(k, row.badge[k]);
				}
			}

			u.search = u.searchParams.toString();

			packageVersion = `![badge-${index}]`;

			LINKS[`badge-${index}`] = u.toString();
		}

		const k = [
			`[${row.title}][link-${index}]`,
			row.status,
			packageVersion,
		];

		LINKS[`link-${index}`] = row.url;

		return `| ${k.join(" | ")} |`;
	}),
]

const OUTPUT = [
	'# About @lachlanmcdonald',
	'',
	'This repository contains information about the repositories maintained by [@lachlanmcdonald](https://github.com/lachlanmcdonald):',
	'',
	...TABLE,
	'',
	'- 🟢 **Actively maintained**: Immediate priority (will support as available)',
	'- 🔵 **Passively maintained**: Lower priority — maintained as needed or when opportunity arises (minimal support)',
	'- 🔴 **Archived**: No longer maintained (no support)',
	'',
	`> Last Updated: ${new Date().toISOString()}`,
	'',
	...Object.entries(LINKS).map(([name, url]) => {
		return `[${name}]: ${url}`;
	}),
];

fs.writeFileSync(path.join(__dirname, 'README.md'), OUTPUT.join('\n').trim() + '\n', 'utf8');
