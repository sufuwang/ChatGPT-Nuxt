import { Button, Input, Form, Collapse, Spin } from "antd";
import { useState } from "react";
import { form as storage } from "../../tools/storage";
import { getResponse, tryCatch } from "../../tools/function";
import styles from "./index.module.scss";

interface FormData {
	apiKey: string;
	question: string;
}
interface ItemData {
	question: string;
	answer: string;
}

const App = () => {
	const [message, setMessage] = useState<ItemData[]>(storage.get());
	const [loading, setLoading] = useState(false);

	const onFinish = async ({ apiKey, question: content }: FormData) => {
		setLoading(true);
		const response = await fetch("https://api.openai.com/v1/chat/completions", {
			method: "post",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${apiKey}`,
			},
			body: JSON.stringify({
				model: "gpt-3.5-turbo",
				messages: [{ role: "user", content }],
			}),
		});
		const res = await getResponse(response);
		tryCatch(
			() => {
				const newMessage = {
					question: content,
					answer: res.choices[0].message.content,
				};
				storage.set(newMessage);
				setMessage(storage.get());
			},
			() => {
				setLoading(false);
			}
		);
	};

	return (
		<div className={styles.container}>
			<Spin spinning={loading}>
				<Form
					name="basic"
					labelCol={{ span: 3 }}
					initialValues={{ remember: true }}
					onFinish={onFinish}
					autoComplete="on"
				>
					<Form.Item
						label="API Key"
						name="apiKey"
						rules={[{ required: true, message: "" }]}
					>
						<Input placeholder="这里是你的 Key" />
					</Form.Item>
					<Form.Item
						label="问题"
						name="question"
						rules={[{ required: true, message: "" }]}
					>
						<Input.TextArea rows={4} placeholder="这里是你的问题" />
					</Form.Item>
					<Form.Item wrapperCol={{ offset: 8, span: 16 }}>
						<Button type="primary" htmlType="submit">
							Submit
						</Button>
					</Form.Item>
				</Form>
			</Spin>
			<div className={styles.message}>
				{message.length ? (
					<Collapse defaultActiveKey={[0]} onChange={console.info}>
						{message.map((item, index) => (
							<Collapse.Panel header={item.question} key={index}>
								<p>{item.answer}</p>
							</Collapse.Panel>
						))}
					</Collapse>
				) : null}
			</div>
		</div>
	);
};

export default App;
