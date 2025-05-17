import { model } from "./open-ai-client.mjs";
import { z } from "zod";

const outputSchema = z.object({
    carName: z.string().describe('name of car'),
    startArea: z.enum(['東北', '関東', '中部', '関西', '九州']).describe('start area'),
    returnArea: z.enum(['東北', '関東', '中部', '関西', '九州']).describe('return area'),
    date: z.string().describe('departure date'),
    tags: z.array(z.enum(['高級車', 'ミニバン', '商用車', 'セダン', 'SUV', 'ワゴン', '軽自動車', 'コンパクトカー'])).describe('feature of car'),
})

export const extractData = async (text) => {
  const structuredllm = model.withStructuredOutput(outputSchema)
  return await structuredllm.invoke(text)
}

// extractData('関西発関東行きにアルファード').then((result) => {
//   console.log(result)
// })