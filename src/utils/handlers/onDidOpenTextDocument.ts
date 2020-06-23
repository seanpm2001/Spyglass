import { TextDocument } from 'vscode-languageserver-textdocument'
import { parseStrings } from '.'
import { VanillaData } from '../../data/VanillaData'
import { FunctionInfo } from '../../types'
import { CacheFile } from '../../types/ClientCache'
import { CommandTree } from '../../types/CommandTree'
import { Config, isRelIncluded } from '../../types/Config'
import { InfosOfUris, Uri } from '../../types/handlers'

export async function onDidOpenTextDocument({ text, uri, rel, version, infos, config, cacheFile, commandTree, roots, vanillaData }: { text: string, uri: Uri, rel: string, roots: Uri[], version: number | null, infos: InfosOfUris, config: Config, cacheFile: CacheFile, commandTree?: CommandTree, vanillaData?: VanillaData }) {
    const info: FunctionInfo = {} as any

    /* istanbul ignore next */
    if (!isRelIncluded(rel, config)) {
        return
    }

    // config
    info.config = config

    // strings
    info.document = TextDocument.create(uri.toString(), 'mcfunction', version as number, text)

    // nodes
    info.nodes = []
    await parseStrings(
        info.document, undefined, undefined,
        info.nodes, config, cacheFile, uri, roots, undefined, commandTree, vanillaData
    )

    infos.set(uri, info)
}
