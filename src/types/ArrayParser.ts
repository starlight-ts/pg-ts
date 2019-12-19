export interface ParsedArrayEntry {
	value: string;
	escaped: boolean;
}

export class ArrayParser<V = string> {

	private source: string;
	private transform: (value: string) => V;
	private position = 0;
	private entries: V[] = [];
	private recorded: string[] = [];
	private dimension = 0;

	public constructor(source: string, transform?: (value: string) => V) {
		this.source = source;
		this.transform = transform ?? ((val): any => val);
	}

	private get eof(): boolean {
		return this.position >= this.source.length;
	}

	private get nextCharacter(): ParsedArrayEntry {
		const character = this.source[this.position++];
		return character === '\\'
			? { value: this.source[this.position++], escaped: true }
			: { value: character, escaped: false };
	}

	public parse(nested: true): V;

	public parse(nested?: false): V[];

	public parse(nested?: boolean): V | V[] {
		let quote: boolean | undefined;
		this.consumeDimensions();
		while (!this.eof) {
			const character = this.nextCharacter;
			if (character.value === '{' && !quote) {
				this.dimension++;
				if (this.dimension > 1) {
					const parser = new ArrayParser(this.source.substr(this.position - 1), this.transform);
					this.entries.push(parser.parse(true));
					this.position += parser.position - 2;
				}
			} else if (character.value === '}' && !quote) {
				this.dimension--;
				if (!this.dimension) {
					this.newEntry();
					if (nested) return this.entries;
				}
			} else if (character.value === '"' && !character.escaped) {
				if (quote) this.newEntry(true);
				quote = !quote;
			} else if (character.value === ',' && !quote) {
				this.newEntry();
			} else {
				this.record(character.value);
			}
		}

		if (this.dimension !== 0) throw new Error('Array dimension not balanced');

		return this.entries;
	}

	private record(character: string): void {
		this.recorded.push(character);
	}

	private newEntry(includeEmpty?: boolean): void {
		if (this.recorded.length > 0 || includeEmpty) {
			let entry: string | null | V = this.recorded.join('');
			if (entry === 'NULL' && !includeEmpty) entry = null;
			if (entry !== null) entry = this.transform(entry);
			this.entries.push(entry!);
			this.recorded = [];
		}
	}

	private consumeDimensions(): void {
		if (this.source.startsWith('[')) {
			while (!this.eof) {
				const { value } = this.nextCharacter;
				if (value === '=') break;
			}
		}
	}

}
