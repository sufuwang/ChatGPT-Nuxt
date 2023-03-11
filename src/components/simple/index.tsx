import { useState } from "react";
import { Button, Input, Form, Collapse, Spin, message as Message } from "antd";
import { form as storage } from "../../tools/storage";
import { tryCatch, fetchWithTimeout } from "../../tools/function";
import styles from "./index.module.scss";

interface FormData {
	secret: string;
	question: string;
}
interface ItemData {
	question: string;
	answer: string;
}

const App = () => {
	const [messageApi, contextHolder] = Message.useMessage();
	const [message, setMessage] = useState<ItemData[]>(storage.get());
	const [loading, setLoading] = useState(false);

	const onFinish = async ({ secret, question: content }: FormData) => {
		setLoading(true);
		console.info({ secret, question: content });
		const response = await fetchWithTimeout({
			request: [
				// "http://localhost:8000/question",
				"http://sufu.site:8000/question",
				{
					method: "post",
					headers: {
						"Content-Type": "application/json;charset=UTF-8",
						secret,
					},
					body: JSON.stringify({
						model: "gpt-3.5-turbo",
						messages: [{ role: "user", content }],
					}),
				},
			],
			onAbort: () => {
				messageApi.error("接口超时, 请稍后再试");
				setLoading(false);
			},
			onFailure: (error) => {
				messageApi.error(error.toString());
				setLoading(false);
			},
		});
		if (!response) {
			setLoading(false);
			return;
		}
		tryCatch(
			() => {
				const newMessage = {
					question: content,
					answer: response[0].message.content.replace(/^\n\n/, ""),
				};
				storage.set(newMessage);
				setMessage(storage.get());
			},
			(err) => {
				messageApi.error(err.toString());
			},
			() => {
				setLoading(false);
			}
		);
	};

	return (
		<div className={styles.container}>
			{contextHolder}
			<Spin spinning={loading}>
				<Form
					name="basic"
					labelCol={{ span: 3 }}
					initialValues={{ remember: true }}
					onFinish={onFinish}
					autoComplete="on"
				>
					<Form.Item
						label="Secret"
						name="secret"
						rules={[{ required: true, message: "" }]}
						initialValue={"test"}
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
					<Form.Item wrapperCol={{ offset: 3 }}>
						<Button type="primary" htmlType="submit">
							确认
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
