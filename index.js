import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import env from 'dotenv'
import {Configuration, OpenAIApi} from 'openai'
import axios from 'axios'

const app = express()

env.config()

app.use(cors())
app.use(bodyParser.json())



const configuration = new Configuration({
    organization: "org-4e3SPQD3qLAOXDzTzfuOZrPz" ,
    apiKey: process.env.OPEN_AI_API_KEY 
})
const openai = new OpenAIApi(configuration)


// listeninng
app.listen("3080", ()=>console.log("listening on port 3080"))
console.log(encodeURIComponent("https://en.wikipedia.org/wiki/The_Human_Centipede_3_(Final_Sequence)"));


// dummy route to test
app.get("/", (req, res) => {
    res.send("Hello World!")
})


//post route for making requests
app.post('/chat', async (req, res)=>{
    const {message} = req.body

    try{
        const response = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: `${message}`,
            max_tokens: 100,
            temperature: .5
        })
        res.json({message: response.data.choices[0].text})

    }catch(e){
        console.log(e)
        res.send(e).status(400)
    }
})
app.post('/generateImage', async (req, res)=>{
    const {prompt} = req.body
    console.log(prompt);

    try{
        
        const response = await openai.createImage({
            prompt: prompt,
            n: 1,
            size: "512x512",
          })
        res.json({url: response.data.data[0].url})
       

    }catch(e){
       
        console.log(e)
        res.send(e).status(400)
    }
})

app.post('/summarize', async (req, res)=>{
    const {articleUrl} = req.body
    const options = {
        method: 'GET',
        url: 'https://article-extractor-and-summarizer.p.rapidapi.com/summarize',
        params: {
          url: articleUrl,
          length: '3'
        },
        headers: {
          'X-RapidAPI-Key': process.env.RAPID_API_KEY,
          'X-RapidAPI-Host': 'article-extractor-and-summarizer.p.rapidapi.com'
        }
      };

    try{
        const response = await axios.request(options);
        console.log(response.data); 
        res.json({summary: response.data})
        
    }catch(e){
        console.log(e)
        res.send(e).status(400)
    }
})



