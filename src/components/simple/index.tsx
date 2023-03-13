import { useState } from "react";
import {
	Button,
	Input,
	Form,
	Collapse,
	Spin,
	message as Message,
	Radio,
} from "antd";
import { form as storage } from "../../tools/storage";
import { tryCatch, fetchWithTimeout, strToArray } from "../../tools/function";
import api, { ApiKey } from "../../tools/api";
import styles from "./index.module.scss";

interface FormData {
	type: keyof typeof FeatureType;
	secret: string;
	question: string;
}
interface ItemData {
	type: ApiKey;
	question: string;
	answer: string | Array<string>;
}

const FeatureType: Record<ApiKey, ApiKey> = {
	question: "question",
	image: "image",
};

const App = () => {
	const [messageApi, contextHolder] = Message.useMessage();
	const [message, setMessage] = useState<ItemData[]>(storage.get());
	const [loading, setLoading] = useState(false);
	const [formType, setFormType] = useState<ApiKey>(FeatureType.question);
	const [contentType, setContentType] = useState("问题");
	const [textAreaPlaceHolder, setTextAreaPlaceHolder] =
		useState("在这里输入你想问的问题");

	const onValuesChange = (_curChangeData: any, formData: FormData) => {
		const { type } = formData;
		setFormType(type);
		if (type === FeatureType.question) {
			setContentType("问题");
			setTextAreaPlaceHolder("在这里输入你想问的问题");
		} else if (type === FeatureType.image) {
			setContentType("描述");
			setTextAreaPlaceHolder("在这里输入你希望获取到的图片的描述");
		}
	};

	const onFinish = async ({ secret, question: content }: FormData) => {
		setLoading(true);
		console.info({ secret, question: content });
		const apiInfo = api[formType];
		const response = await fetchWithTimeout({
			request: [
				apiInfo.path,
				{
					method: "post",
					headers: {
						"Content-Type": "application/json;charset=UTF-8",
						secret,
					},
					body: apiInfo.getBody(content),
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
					type: formType,
					question: content,
					answer: apiInfo.getResult(response),
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
					className={styles.form}
					initialValues={{ type: FeatureType.question, secret: "test" }}
					onValuesChange={onValuesChange}
					onFinish={onFinish}
					autoComplete="on"
				>
					<Form.Item label="类型" name="type">
						<Radio.Group>
							<Radio.Button value={FeatureType.question}>提问</Radio.Button>
							<Radio.Button value={FeatureType.image}>搜图</Radio.Button>
						</Radio.Group>
					</Form.Item>
					<Form.Item
						label="Secret"
						name="secret"
						rules={[{ required: true, message: "" }]}
					>
						<Input placeholder="这里是你的 Key" />
					</Form.Item>
					<Form.Item
						label={contentType}
						name="question"
						rules={[{ required: true, message: "" }]}
					>
						<Input.TextArea rows={3} placeholder={textAreaPlaceHolder} />
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
					<Collapse defaultActiveKey={[0]} onChange={() => null}>
						{message.map((item, index) => {
							const data = renderCollapseContent(item);
							return (
								<Collapse.Panel header={data.title} key={index}>
									<p>{data.content}</p>
								</Collapse.Panel>
							);
						})}
					</Collapse>
				) : null}
			</div>
		</div>
	);
};

const renderCollapseContent = (data: ItemData) => {
	if (data.type === FeatureType.image) {
		const urls = strToArray(data.answer);
		console.info("urls: ", data, urls);
		return {
			title: data.question,
			content: urls
				.filter((d) => d.startsWith("https://"))
				.map((url) => <img key={url} src={url} alt="图片加载失败" />),
		};
	}
	return {
		title: data.question,
		content: data.answer,
	};
};

export default App;
