import { tryCatch } from "./function";

/**
 * form 组件内部缓存与 chatGPT 的对话
 */
export const form = {
	key: "form",
	get() {
		const { value } = JSON.parse(
			localStorage.getItem(this.key) ?? '{"value": []}'
		);
		return value;
	},
	set<T>(value: T) {
		tryCatch(() => {
			const oldValue = this.get();
			localStorage.setItem(
				this.key,
				JSON.stringify({ value: [value, ...oldValue.slice(0, 18)] })
			);
		});
	},
};
