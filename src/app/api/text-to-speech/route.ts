import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import fs from 'fs'
import path from 'path'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const speechFile = path.resolve('./public/speech.mp3')

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const input = body.input
    const mp3 = await openai.audio.speech.create({
      model: 'tts-1',
      voice: 'alloy',
      input,
    })

    if (!mp3 || typeof mp3.arrayBuffer !== 'function') {
      console.error('Invalid API response:', mp3)
      return NextResponse.json(
        { error: 'Invalid API response.' },
        { status: 500 },
      )
    }

    const buffer = Buffer.from(await mp3.arrayBuffer())
    console.log('Buffer length:', buffer.length)
    await fs.promises.writeFile(speechFile, buffer)

    const stats = await fs.promises.stat(speechFile)

    console.log('File written. Size:', stats.size)

    return NextResponse.json(
      { message: 'Audio generated successfully!', path: speechFile },
      { status: 200 },
    )
  } catch (error) {
    console.error('Error generating audio:', error)
    return NextResponse.json(
      { error: 'Failed to generate audio.' },
      { status: 500 },
    )
  }
}
