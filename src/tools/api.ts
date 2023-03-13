import { CreateChatCompletionRequest, CreateImageRequest } from "openai";

// const domain = "http://localhost:8000";
const domain = "http://sufu.site:8000";

const api = {
	question: {
		path: `${domain}/question`,
		getBody(content: CreateChatCompletionRequest["messages"][0]["content"]) {
			const data: CreateChatCompletionRequest = {
				model: "gpt-3.5-turbo",
				messages: [{ role: "user", content }],
			};
			return JSON.stringify(data);
		},
		getResult(response: any) {
			return response[0].message.content.replace(/^\n\n/, "");
		},
	},
	image: {
		path: `${domain}/image`,
		getBody(content: CreateImageRequest["prompt"]) {
			const data: CreateImageRequest = {
				prompt: content,
				n: 2,
				size: "256x256",
			};
			return JSON.stringify(data);
		},
		getResult(response: any) {
			return response.map((d: any) => d.url);
		},
	},
};
export type ApiKey = keyof typeof api;
export default api;
