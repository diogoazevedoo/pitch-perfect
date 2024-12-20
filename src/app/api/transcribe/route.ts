import { createReadStream } from 'fs'
import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import path from 'path'

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
})

const transcribe = async (audioPath: string, language: string) => {
  const audioStream = createReadStream(audioPath)
  try {
    const response = await openai.audio.transcriptions.create({
      file: audioStream,
      model: 'whisper-1',
      language,
      response_format: 'json',
      temperature: 0,
      prompt: `
        Transcribe the audio exactly as spoken, including any spelling, grammar, or pronunciation errors. Do not correct, alter, or interpret the original content in any way. The transcription should reflect the speaker’s exact words, even if there are mistakes or inconsistencies. This includes incomplete sentences, mispronunciations, and non-standard grammar.
        The audio file is in ${language}. Please transcribe the audio into text.  
      `,
    })

    return response.text
  } catch (error) {
    console.error('Error transcribing audio:', error)
    throw new Error('Failed to transcribe audio')
  }
}

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('file') as Blob
  const language = formData.get('language') as string

  if (!file || !language) {
    return NextResponse.json(
      { error: 'File or language missing' },
      { status: 400 },
    )
  }

  const filePath = path.join(__dirname, 'audio.wav')
  const buffer = Buffer.from(await file.arrayBuffer())
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('fs').writeFileSync(filePath, buffer)

  try {
    const transcription = await transcribe(filePath, language)
    return NextResponse.json({ transcription })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
