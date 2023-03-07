export const tryCatch = (tryFunc: Function, finalFunc?: Function) => {
	try {
		tryFunc();
	} catch (err) {
		console.error(err);
	} finally {
		finalFunc && finalFunc();
	}
};

export const getResponse = async (response: Response): Promise<any> => {
	const reader = response.body!.getReader();
	// Step 2：获得总长度（length）
	const contentLength = +(response.headers.get("Content-Length") ?? 0);
	// Step 3：读取数据
	let receivedLength = 0; // 当前接收到了这么多字节
	const chunks = []; // 接收到的二进制块的数组（包括 body）
	while (true) {
		const { done, value } = await reader.read();
		if (done) {
			break;
		}
		chunks.push(value);
		receivedLength += value.length;
		console.log(`Received ${receivedLength} of ${contentLength}`);
	}
	// Step 4：将块连接到单个 Uint8Array
	const chunksAll = new Uint8Array(receivedLength); // (4.1)
	let position = 0;
	for (let chunk of chunks) {
		chunksAll.set(chunk, position); // (4.2)
		position += chunk.length;
	}
	// Step 5：解码成字符串
	return JSON.parse(new TextDecoder("utf-8").decode(chunksAll));
};
