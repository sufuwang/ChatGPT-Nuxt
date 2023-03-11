export const tryCatch = (
	tryFunc: () => void,
	catchFunc?: (err: any) => void,
	finalFunc?: () => void
) => {
	try {
		tryFunc?.();
	} catch (err) {
		catchFunc?.(err);
		console.error(err);
	} finally {
		finalFunc?.();
	}
};

export const getResponse = async (response: Response): Promise<any> => {
	const reader = response.body!.getReader();
	let receivedLength = 0; // 当前接收到了这么多字节
	const chunks = []; // 接收到的二进制块的数组（包括 body）
	while (true) {
		const { done, value } = await reader.read();
		if (done) {
			break;
		}
		chunks.push(value);
		receivedLength += value.length;
	}
	const chunksAll = new Uint8Array(receivedLength); // (4.1)
	let position = 0;
	for (let chunk of chunks) {
		chunksAll.set(chunk, position); // (4.2)
		position += chunk.length;
	}
	let data = new TextDecoder("utf-8").decode(chunksAll);
	try {
		data = JSON.parse(data);
	} catch {}
	return data;
};

type FetchWithTimeout = (h: {
	request: Parameters<typeof fetch>;
	onAbort?: Function;
	onFailure?: (err: string) => void;
}) => Promise<any>;
export const fetchWithTimeout: FetchWithTimeout = ({
	request: [input, init],
	onAbort,
	onFailure,
}) => {
	const abortController = new AbortController();
	let id = 0;
	console.info("init: ", init);
	return Promise.race<any>([
		fetch(input, { ...init, signal: abortController.signal }).then(
			async (data) => {
				if (id > -1) {
					clearTimeout(id);
					id = -1;
				}
				const res = await getResponse(data);
				if (![200].includes(data.status)) {
					onFailure?.(res.errInfo);
					return Promise.reject(data);
				}
				return res;
			},
			(error) => {
				if (abortController.signal.aborted === false) {
					onFailure?.(error.toString());
				}
			}
		),
		new Promise((resolve) => {
			id = +setTimeout(() => {
				abortController.abort();
				onAbort?.();
				resolve(null);
			}, 30000);
		}),
	]);
};
