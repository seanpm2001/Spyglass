import { ArgumentParserResult, combineArgumentParserResult } from '../types/Parser'
import { nbtDocs } from 'mc-nbt-paths'
import { NbtCompoundTag } from '../types/NbtTag'
import ArgumentParser from './ArgumentParser'
import Block from '../types/Block'
import Config from '../types/Config'
import Identity from '../types/Identity'
import Manager from '../types/Manager'
import StringReader from '../utils/StringReader'
import VanillaBlockDefinitions from '../types/VanillaBlockDefinitions'
import VanillaRegistries from '../types/VanillaRegistries'
import { GlobalCache } from '../types/Cache'
import MapAbstractParser from './MapAbstractParser'
import ParsingError from '../types/ParsingError'

export default class BlockArgumentParser extends ArgumentParser<Block> {
    readonly identity = 'block'

    // istanbul ignore next
    constructor(
        private readonly allowTag = false,
        private readonly blockDefinitions = VanillaBlockDefinitions,
        private readonly registries = VanillaRegistries,
        private readonly nbtSchema = nbtDocs
    ) {
        super()
    }

    private config: Config | undefined
    private cache: GlobalCache | undefined
    private manager: Manager<ArgumentParser<any>>

    parse(reader: StringReader, cursor = -1, manager: Manager<ArgumentParser<any>>, config?: Config, cache?: GlobalCache): ArgumentParserResult<Block> {
        const ans: ArgumentParserResult<Block> = {
            data: new Block(new Identity()),
            errors: [],
            cache: {},
            completions: []
        }
        this.manager = manager
        this.config = config
        this.cache = cache

        const idResult = this.manager.get('NamespacedID', ['minecraft:block', this.registries, this.allowTag]).parse(reader, cursor, this.manager, this.config, this.cache)
        const id = idResult.data as Identity
        combineArgumentParserResult(ans, idResult)
        ans.data.id = id

        this.parseStates(reader, cursor, ans, id)
        this.parseTag(reader, cursor, ans, id)

        return ans
    }

    private parseStates(reader: StringReader, cursor: number, ans: ArgumentParserResult<Block>, id: Identity): void {
        if (reader.peek() === Block.StatesBeginSymbol) {
            // FIXME: Completions for block tags.
            const definition = this.blockDefinitions[id.toString()]
            const properties = definition ? (definition.properties || {}) : {}

            new MapAbstractParser<string, Block>(
                Block.StatesBeginSymbol, '=', ',', Block.StatesEndSymbol,
                (manager, ans) => {
                    const existingKeys = Object.keys(ans.data.states)
                    const keys = Object.keys(properties).filter(v => !existingKeys.includes(v))
                    return manager.get('Literal', keys)
                },
                (ans, reader, cursor, manager, config, cache, key, range) => {
                    if (Object.keys(ans.data.states).filter(v => v === key).length > 0) {
                        ans.errors.push(new ParsingError(range, `duplicate key ‘${key}’`))
                    }
                    const result = manager.get('Literal', properties[key]).parse(reader, cursor, manager, config, cache)
                    ans.data.states[key] = result.data
                    combineArgumentParserResult(ans, result)
                }
            ).parse(ans, reader, cursor, this.manager, this.config, this.cache)
        }
    }

    private parseTag(reader: StringReader, cursor: number, ans: ArgumentParserResult<Block>, id: Identity): void {
        if (reader.peek() === '{') {
            // FIXME: NBT schema for block tags.
            const tagResult = this.manager.get('NbtTag', ['compound', 'blocks', id.toString(), this.nbtSchema]).parse(reader, cursor, this.manager, this.config, this.cache)
            const tag = tagResult.data as NbtCompoundTag
            combineArgumentParserResult(ans, tagResult)
            ans.data.nbt = tag
        }
    }

    getExamples(): string[] {
        return ['stone', 'minecraft:stone', 'stone[foo=bar]', 'stone{bar:baz}']
    }
}
