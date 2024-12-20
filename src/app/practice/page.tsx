'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Mic, StopCircle, Search, X, ChevronsUpDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'

const languages = [
  { value: 'en', label: 'English', flag: '🇺🇸' },
  { value: 'zh', label: 'Chinese', flag: '🇨🇳' },
  { value: 'de', label: 'German', flag: '🇩🇪' },
  { value: 'es', label: 'Spanish', flag: '🇪🇸' },
  { value: 'ru', label: 'Russian', flag: '🇷🇺' },
  { value: 'ko', label: 'Korean', flag: '🇰🇷' },
  { value: 'fr', label: 'French', flag: '🇫🇷' },
  { value: 'ja', label: 'Japanese', flag: '🇯🇵' },
  { value: 'pt', label: 'Portuguese', flag: '🇵🇹' },
  { value: 'tr', label: 'Turkish', flag: '🇹🇷' },
  { value: 'pl', label: 'Polish', flag: '🇵🇱' },
  { value: 'ca', label: 'Catalan', flag: '🏴' },
  { value: 'nl', label: 'Dutch', flag: '🇳🇱' },
  { value: 'ar', label: 'Arabic', flag: '🇸🇦' },
  { value: 'sv', label: 'Swedish', flag: '🇸🇪' },
  { value: 'it', label: 'Italian', flag: '🇮🇹' },
  { value: 'id', label: 'Indonesian', flag: '🇮🇩' },
  { value: 'hi', label: 'Hindi', flag: '🇮🇳' },
  { value: 'fi', label: 'Finnish', flag: '🇫🇮' },
  { value: 'vi', label: 'Vietnamese', flag: '🇻🇳' },
  { value: 'he', label: 'Hebrew', flag: '🇮🇱' },
  { value: 'uk', label: 'Ukrainian', flag: '🇺🇦' },
  { value: 'el', label: 'Greek', flag: '🇬🇷' },
  { value: 'ms', label: 'Malay', flag: '🇲🇾' },
  { value: 'cs', label: 'Czech', flag: '🇨🇿' },
] as const

type Language = (typeof languages)[number]

export interface Pronunciation {
  score: number
  improvements: string[]
}

export interface Correction {
  original: string
  suggested: string
  explanation: string
}

export interface Grammar {
  score: number
  corrections: Correction[]
}

export interface Metrics {
  professionalism: number
  clarity: number
  engagement: number
}

export interface Tone {
  overall: string
  metrics: Metrics
}

export interface AnalysisResult {
  confidenceScore: number
  pronunciation: Pronunciation
  grammar: Grammar
  tone: Tone
  speakingPace: number
  suggestions: string[]
}

const getScoreColorText = (score: number): string => {
  if (score < 0.4) return 'text-red-500'
  if (score < 0.7) return 'text-orange-500'
  return 'text-green-500'
}

const getScoreColorBar = (score: number): string => {
  if (score < 0.4) return '#f87171'
  if (score < 0.7) return 'b#fbbf24'
  return '#4ade80s'
}

export default function Practice() {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null,
  )
  const [activeTab, setActiveTab] = useState('record')
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(
    null,
  )
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [scenario, setScenario] = useState('')

  const filteredLanguages = languages.filter((language) =>
    language.label.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const [isAudioModalOpen, setAudioModalOpen] = useState(false)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder

      const audioChunks: Blob[] = []
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' })
        setAudioBlob(audioBlob)
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Error accessing microphone:', error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  const transcribeAudio = async () => {
    if (audioBlob && selectedLanguage) {
      const formData = new FormData()
      formData.append('file', audioBlob, 'audio.wav')
      formData.append('language', selectedLanguage.value)

      try {
        const response = await fetch('/api/transcribe', {
          method: 'POST',
          body: formData,
        })

        if (response.ok) {
          const { transcription } = await response.json()
          setTranscript(transcription)
          analyzeSpeech(transcription)
        } else {
          console.error('Error transcribing audio')
        }
      } catch (error) {
        console.error('Error during transcription:', error)
      }
    }
  }

  const analyzeSpeech = async (transcription: string) => {
    try {
      const response = await fetch('/api/analyze-with-context', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcription, context: scenario }),
      })

      if (response.ok) {
        const result = await response.json()

        setAnalysisResult(JSON.parse(result))
        setActiveTab('results')
      } else {
        console.error('Error analyzing speech:', await response.text())
      }
    } catch (error) {
      console.error('Error during speech analysis:', error)
    }
  }

  const playImprovementAudio = async (improvement: string) => {
    try {
      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: improvement }),
      })

      if (!response.ok) {
        console.error('Failed to fetch improvement audio')
        return
      }

      setAudioModalOpen(true)
    } catch (error) {
      console.error('Error playing improvement audio:', error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 to-purple-100 p-4">
      <Card className="w-full max-w-4xl mx-auto shadow-xl shadow-purple-100">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center text-purple-600">
            AI-Assisted Speech Practice
          </CardTitle>
          <CardDescription className="text-center text-purple-500">
            Improve your speaking skills with AI-generated prompts and analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-4"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="record">Record</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
            </TabsList>
            <TabsContent value="record" className="space-y-4">
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 items-center gap-4">
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between"
                      >
                        {selectedLanguage ? (
                          <>
                            <span className="mr-2">
                              {selectedLanguage.flag}
                            </span>
                            <span>{selectedLanguage.label}</span>
                          </>
                        ) : (
                          'Select language...'
                        )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <div className="flex items-center border-b px-3 py-2">
                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                        <Input
                          placeholder="Search language..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="border-0 focus:ring-0"
                        />
                        {searchQuery && (
                          <X
                            className="h-4 w-4 shrink-0 opacity-50 cursor-pointer"
                            onClick={() => setSearchQuery('')}
                          />
                        )}
                      </div>
                      <ScrollArea className="h-72">
                        <div className="grid grid-cols-2 gap-2 p-4">
                          {filteredLanguages.map((language) => (
                            <Button
                              key={language.value}
                              onClick={() => {
                                setSelectedLanguage(language)
                                setOpen(false)
                              }}
                              className="justify-start font-normal"
                              variant="ghost"
                            >
                              <span className="mr-2">{language.flag}</span>
                              <span>{language.label}</span>
                            </Button>
                          ))}
                        </div>
                      </ScrollArea>
                    </PopoverContent>
                  </Popover>
                </div>
                <Textarea
                  placeholder="Describe your practice scenario (e.g., 'Act like my best friend, the theme will be about sports')"
                  value={scenario}
                  onChange={(e) => setScenario(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              <div className="flex justify-center items-center space-x-4">
                <Button
                  size="lg"
                  variant={isRecording ? 'destructive' : 'default'}
                  className="w-40 h-40 rounded-full flex flex-col items-center justify-center bg-purple-600 text-white hover:bg-purple-700"
                  onClick={toggleRecording}
                  disabled={!selectedLanguage || !scenario.trim()}
                >
                  {isRecording ? (
                    <StopCircle className="h-16 w-16 mb-2" />
                  ) : (
                    <Mic className="h-16 w-16 mb-2" />
                  )}
                  <span>{isRecording ? 'Stop' : 'Start'}</span>
                </Button>
              </div>
              {audioBlob && !isRecording && (
                <div className="flex justify-center">
                  <Button
                    onClick={transcribeAudio}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Transcribe and Analyze
                  </Button>
                </div>
              )}
              <Card>
                <CardHeader>
                  <CardTitle>Transcript</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea
                    className="h-[200px] w-full rounded-md border p-4"
                    ref={scrollAreaRef}
                  >
                    <p>{transcript}</p>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="results" className="space-y-4">
              {analysisResult ? (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle>Confidence Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center space-x-2">
                        <Progress
                          value={analysisResult.confidenceScore * 100}
                          className={`w-full ${getScoreColorBar(analysisResult.confidenceScore)}`}
                        />
                        <span
                          className={`text-2xl font-bold ${getScoreColorText(analysisResult.confidenceScore)}`}
                        >
                          {(analysisResult.confidenceScore * 100).toFixed(0)}%
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Pronunciation</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center space-x-2 mb-4">
                        <Progress
                          value={analysisResult.pronunciation.score * 100}
                          className={`w-full ${getScoreColorBar(analysisResult.grammar.score)}`}
                        />
                        <span
                          className={`text-2xl font-bold ${getScoreColorText(analysisResult.pronunciation.score)}`}
                        >
                          {(analysisResult.pronunciation.score * 100).toFixed(
                            0,
                          )}
                          %
                        </span>
                      </div>
                      <h4 className="font-semibold mb-2">Improvements:</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {analysisResult.pronunciation.improvements.map(
                          (improvement, idx) => (
                            <li
                              key={idx}
                              className="text-purple-600 flex items-center space-x-2"
                            >
                              <span>{improvement}</span>
                              <button
                                onClick={() =>
                                  playImprovementAudio(improvement)
                                }
                                className="bg-purple-600 text-white px-2 py-1 rounded hover:bg-purple-700"
                              >
                                Play
                              </button>
                            </li>
                          ),
                        )}
                      </ul>
                    </CardContent>
                  </Card>

                  {isAudioModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                      <div className="bg-white rounded-lg shadow-lg p-6 w-11/12 md:w-1/3">
                        <h3 className="text-lg font-semibold mb-4 text-gray-800">
                          Sample Audio
                        </h3>
                        <audio controls className="w-full">
                          <source src="/speech.mp3" type="audio/mpeg" />
                          Your browser does not support the audio element.
                        </audio>
                        <div className="flex justify-end mt-4">
                          <Button
                            onClick={() => setAudioModalOpen(false)}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            Close
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  <Card>
                    <CardHeader>
                      <CardTitle>Grammar</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center space-x-2 mb-4">
                        <Progress
                          value={analysisResult.grammar.score * 100}
                          className={`w-full ${getScoreColorBar(analysisResult.grammar.score)}`}
                        />
                        <span
                          className={`text-2xl font-bold ${getScoreColorText(analysisResult.grammar.score)}`}
                        >
                          {(analysisResult.grammar.score * 100).toFixed(0)}%
                        </span>
                      </div>
                      <h4 className="font-semibold mb-2">Corrections:</h4>
                      <ul className="space-y-2">
                        {analysisResult.grammar.corrections.map(
                          (correction, idx) => (
                            <li key={idx} className="bg-purple-100 p-2 rounded">
                              <p>
                                <strong className="text-red-500">
                                  {correction.original}
                                </strong>{' '}
                                →{' '}
                                <strong className="text-green-500">
                                  {correction.suggested}
                                </strong>
                              </p>
                              <p className="text-sm text-purple-600">
                                {correction.explanation}
                              </p>
                            </li>
                          ),
                        )}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Tone Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-lg mb-4 text-purple-600">
                        {analysisResult.tone.overall}
                      </p>
                      <div className="grid grid-cols-3 gap-4">
                        {Object.entries(analysisResult.tone.metrics).map(
                          ([key, value]) => (
                            <div key={key} className="text-center">
                              <h5 className="font-semibold mb-2 capitalize text-purple-600">
                                {key}
                              </h5>
                              <Progress
                                value={value * 100}
                                className={`w-full mb-2 ${getScoreColorBar(value)}`}
                              />
                              <span className={`${getScoreColorText(value)}`}>
                                {(value * 100).toFixed(0)}%
                              </span>
                            </div>
                          ),
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Speaking Pace</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold mb-2 text-purple-600">
                        {analysisResult.speakingPace} words/min
                      </div>
                      <p className="text-sm text-purple-500">
                        {analysisResult.speakingPace < 130
                          ? 'Slow'
                          : analysisResult.speakingPace > 160
                            ? 'Fast'
                            : 'Normal'}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Suggestions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {analysisResult.suggestions.map((suggestion, idx) => (
                          <li key={idx} className="text-purple-600">
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <p>No analysis available yet.</p>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-purple-500">
            Select a language, describe your scenario, then click the microphone
            button to start or stop recording your speech.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
