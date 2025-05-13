import { ChatOpenAI } from "@langchain/openai";
import { config } from "dotenv";

config()

export const model = new ChatOpenAI({
    model: "gpt-4.1-mini",
    apiKey: process.env.OPENAI_API_KEY,
})