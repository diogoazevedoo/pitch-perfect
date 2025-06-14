import { NextRequest, NextResponse } from 'next/server'
import { OpenAI } from 'openai'

const openai = new OpenAI({
  apiKey:
    'your-openai-api-key',
})

const analyzeTranscription = async (transcription: string, context: string) => {
  const prompt = `
    You are a speech and language analysis assistant. The user is preparing for the following context: "${context}". 
    Analyze the following transcription of speech and provide a detailed analysis including:
    1. Confidence Score (0-1 scale)
    2. Pronunciation Score (0-1 scale) and suggestions for improvement
    3. Grammar Score (0-1 scale) with suggested corrections and explanations
    4. Tone Analysis (overall tone and a breakdown of professionalism, clarity, and engagement)
    5. Speaking Pace (in words per minute)
    6. Suggestions to improve the speech overall

    Transcription: "${transcription}"

    Provide the results in JSON with this format(typescript):

    type AnalysisResult = {
      confidenceScore: number
      pronunciation: {
        score: number
        improvements: string[]
      }
      grammar: {
        score: number
        corrections: Array<{
          original: string
          suggested: string
          explanation: string
        }>
      }
      tone: {
        overall: string
        metrics: {
          professionalism: number
          clarity: number
          engagement: number
        }
      }
      speakingPace: number
      suggestions: string[]
    }
  `

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo-16k',
    messages: [
      {
        role: 'system',
        content: 'You are a language analysis assistant.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
  })

  return response.choices[0].message.content
}

export async function POST(req: NextRequest) {
  try {
    const { transcription, context } = await req.json()

    if (!context || !transcription) {
      return NextResponse.json(
        { error: 'Both transcription and context are required' },
        { status: 400 },
      )
    }

    const analysisResult = await analyzeTranscription(transcription, context)
    return NextResponse.json(analysisResult)
  } catch (error) {
    console.error('Error analyzing transcription:', error)
    return NextResponse.json(
      { error: 'Failed to analyze transcription' },
      { status: 500 },
    )
  }
}
