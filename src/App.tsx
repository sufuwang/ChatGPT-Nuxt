import Simple from "./components/simple";
import "./App.css";
import axios from "axios";

// axios.post(
// 	"https://api.openai.com/v1/chat/completions",
// 	JSON.stringify({
// 		model: "gpt-3.5-turbo",
// 		messages: [{ role: "user", content: "你叫什么呀" }],
// 	}),
// 	{
// 		headers: {
// 			"Content-Type": "application/json",
// 			Authorization: `Bearer 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`,
// 		},
// 		timeout: 300000,
// 		// httpsAgent: new https.Agent({ rejectUnauthorized: false }),
// 	}
// );

function App() {
	return (
		<div className="App">
			<Simple />
		</div>
	);
}

export default App;
