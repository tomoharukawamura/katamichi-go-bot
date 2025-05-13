import tags from '../json/car-tag.json' with { type: 'json' }
import { PromptTemplate, FewShotPromptTemplate } from '@langchain/core/prompts'
import { model } from './open-ai-client.mjs'
import { StructuredOutputParser } from '@langchain/core/output_parsers'
import { RunnableSequence } from '@langchain/core/runnables'
import { z } from 'zod'

const tagOutPutSchema = z.object({
  name: z.string().describe('name of car'), 
  tags: z.array(z.string()).describe('tags')
})

export class CarInfomation {
  constructor() {
    this.carTags = tags.reduce((acc, { name, tags }) => [
      ...acc,
      ...tags.map(t => ({ name, tag: t }))
    ], [])
    this.examplePrompt = PromptTemplate.fromTemplate(
      "車種名: {name}, タグ: {tag}"
    )
    this.prompt = new FewShotPromptTemplate({
      examples: this.carTags,
      examplePrompt: this.examplePrompt,
      prefix: "Answer tags according to the car name below. If hybrid car, please add 'hybrid' to tags. Moreover, if car name is wrong, please correct it.\n{formatInstruction}\n",
      suffix: "\n車種名: {name}\n",
      inputVariables: ['name', 'formatInstruction'],
    })
    this.carPredictionPrompt = new FewShotPromptTemplate({
      examples: this.carTags,
      examplePrompt: this.examplePrompt,
      prefix: "Answer cars according to the car tag below.\n{formatInstruction}\n",
      suffix: "\n タグ名: {tag}\n",
      inputVariables: ['tag', 'formatInstruction'],
    })
    this.outputParser = StructuredOutputParser.fromZodSchema(tagOutPutSchema)
    this.carPredictionPromptOutput = StructuredOutputParser.fromZodSchema(z.array(z.string()))
    this.chain = RunnableSequence.from([
      this.prompt,
      model,
      this.outputParser
    ])
    this.carPredictionChain = RunnableSequence.from([
      this.carPredictionPrompt,
      model,
      this.carPredictionPromptOutput
    ])
  }

  async listCars(tag) {
    this.carPredictionChain.invoke({
      tag,
      formatInstruction: this.carPredictionPromptOutput.getFormatInstructions()
    })
    .then((result) => {
      console.log(result)
    })
  }
}