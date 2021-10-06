import { localize } from '@spyglassmc/locales'
import type { LanguageErrorInfo, RangeLike } from '../source'
import { ErrorSeverity, LanguageError, Range } from '../source'

export class ErrorReporter {
	public errors: LanguageError[] = []

	constructor() { }

	/**
	 * Reports a new error.
	 */
	report(message: string, range: RangeLike, severity = ErrorSeverity.Error, info?: LanguageErrorInfo): void {
		this.errors.push(LanguageError.create(message, Range.get(range), severity, info))
	}

	/**
	 * @returns All reported errors, and then clears the error stack.
	 */
	dump(): readonly LanguageError[] {
		const ans = Object.freeze(this.errors)
		this.errors = []
		return ans
	}

	/**
	 * Adds all errors from another reporter's error stack to the current reporter.
	 * This method does not affect the passed-in reporter.
	 */
	absorb(reporter: ErrorReporter): void {
		this.errors.push(...reporter.errors)
	}
}

export class LinterErrorReporter extends ErrorReporter {
	constructor(
		public ruleName: string,
		public ruleSeverity: ErrorSeverity
	) {
		super()
	}

	lint(message: string, range: RangeLike, info?: LanguageErrorInfo): void {
		return this.report(
			localize('linter.diagnostic-message-wrapper', message, this.ruleName),
			range,
			this.ruleSeverity,
			info
		)
	}

	static fromErrorReporter(reporter: ErrorReporter, ruleName: string, ruleSeverity: ErrorSeverity): LinterErrorReporter {
		const ans = new LinterErrorReporter(ruleName, ruleSeverity)
		ans.errors = reporter.errors
		return ans
	}
}
