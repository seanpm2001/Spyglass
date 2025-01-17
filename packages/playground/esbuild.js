#!/usr/bin/env node
import esbuild from 'esbuild'

try {
	const mode = process.argv[2]
	if (mode !== 'dev' && mode !== 'prod' && mode !== 'watch') {
		throw new Error('Usage: ./esbuild.js dev|prod|watch')
	}

	const isDev = mode !== 'prod'
	const isWatch = mode === 'watch'
	console.info('Start building...')
	const result = await esbuild.build({
		entryPoints: ['./out/index.js'],
		outfile: './dist/index.js',
		format: 'esm',
		platform: 'node',
		target: ['firefox89', 'chrome93'],
		bundle: true,
		external: ['electron', 'vscode'],
		sourcemap: isDev,
		minify: !isDev,
		watch: isWatch ? {
			onRebuild(error, result) {
				if (!result) {
					console.error('No result on rebuild', error)
				} else {
					logResult(result)
				}
			}
		} : undefined,
	})
	logResult(result)
} catch (e) {
	console.error(e)
	process.exitCode = 1;
}

/**
 * @param {esbuild.BuildResult} result 
 */
function logResult(result) {
	if (result.errors.length === 0) {
		console.info('Built successfully.')
	}
}
