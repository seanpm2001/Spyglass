import { showWhitespaceGlyph, testParser } from '@spyglassmc/core/test-out/utils'
import { describe, it } from 'mocha'
import snapshot from 'snap-shot-it'
import { CommandArgumentTestSuites } from './_suites'
import { argument } from '../../../lib/parser'
import type { ArgumentTreeNode } from '../../../src/tree'

describe('mcfunction argument minecraft:entity_anchor', () => {
	for (const { content, properties } of CommandArgumentTestSuites['minecraft:entity_anchor']!) {
		const treeNode: ArgumentTreeNode = {
			type: 'argument',
			parser: 'minecraft:entity_anchor',
			properties,
		}
		for (const string of content) {
			it(`Parse "${showWhitespaceGlyph(string)}"${properties ? ` with ${JSON.stringify(properties)}` : ''}`, () => {
				snapshot(testParser(argument('test', treeNode), string))
			})
		}
	}
})
