import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import env from "dotenv";
import { Configuration, OpenAIApi } from "openai";
import axios from "axios";

const app = express();

env.config();


const corsOptions ={
   origin:'*', 
   credentials:true,            //access-control-allow-credentials:true
   optionSuccessStatus:200,
}

app.use(cors(corsOptions)) 
app.use(bodyParser.json());

const configuration = new Configuration({
	organization: "org-4e3SPQD3qLAOXDzTzfuOZrPz",
	apiKey: process.env.OPEN_AI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// listeninng
app.listen("3080", () => console.log("listening on port 3080"));

// dummy route to test
app.get("/", (req, res) => {
	res.send("Hello World!");
});

//post route for making requests
app.post("/chat", async (req, res) => {
	res.set('Access-Control-Allow-Origin', '*');
	const { message } = req.body;
	

	try {
		const response = await openai.createCompletion({
			model: "text-davinci-003",
			prompt: `${message}`,
			max_tokens: 400,
			temperature: 0.5,
		});
		res.json({ message: response.data.choices[0].text });
		console.log(response);
	} catch (e) {
		console.log(e);
		res.send(e).status(400);
	}
});
app.post("/generateImage", async (req, res) => {
	const { prompt } = req.body;
	console.log(prompt);

	try {
		const response = await openai.createImage({
			prompt: prompt,
			n: 1,
			size: "512x512",
		});
		res.json({ url: response.data.data[0].url });
		console.log(response.data.data[0].url);
	} catch (e) {
		console.log(e);
		res.send(e).status(400);
	}
});

app.post("/summarize", async (req, res) => {
	const { articleUrl } = req.body;
	const options = {
		method: "GET",
		url: "https://article-extractor-and-summarizer.p.rapidapi.com/summarize",
		params: {
			url: articleUrl,
			length: "3",
		},
		headers: {
			"X-RapidAPI-Key": process.env.RAPID_API_KEY,
			"X-RapidAPI-Host": "article-extractor-and-summarizer.p.rapidapi.com",
		},
	};

	try {
		const response = await axios.request(options);
		console.log(response.data);
		res.json({ summary: response.data });
	} catch (e) {
		console.log(e);
		res.send(e).status(400);
	}
});

app.post("/querry", async (req, res) => {
	const { queryDescription } = req.body;
	console.log(queryDescription);
    // const queryDescription="select all the elements from a  table students"
	const message = [
		{
			role: "system",
			content: `You are a translator from plain English to SQL.`,
		},
		{
			role: "user",
			content: `Convert the following natural language description into a SQL query:\n\nShow all all the elements in the table users`,
		},
		{ role: "assistant", content: "SELECT * FROM users;" },
		{
			role: "user",
			content: `Convert the following natural language description into a SQL query:\n\n${queryDescription}.give sql query only in one line.`,
		},
	];
	
	try {
		const response = await openai.createChatCompletion({
			model: "gpt-3.5-turbo",
			messages: message
			
		});
		res.json({ message:  response.data.choices[0].message.content });
		console.log(response);
	} catch (e) {
		console.log(e);
		res.send(e).status(400);
	}
});
