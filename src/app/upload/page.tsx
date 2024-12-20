'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UploadIcon, Loader2, FileAudio, Search, X } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'

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

type AnalysisResult = {
  transcript: string
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
  wordCount: number
  speakingPace: number
  suggestions: string[]
}

export default function Upload() {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(
    null,
  )
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null,
  )
  const [activeTab, setActiveTab] = useState('upload')
  const [uploadError, setUploadError] = useState<string | null>(null)

  const filteredLanguages = languages.filter((language) =>
    language.label.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    setUploadError(null)

    if (selectedFile) {
      if (!selectedFile.type.match(/^(audio|video)/)) {
        setUploadError('Please upload an audio or video file')
        return
      }

      if (selectedFile.size > 100 * 1024 * 1024) {
        setUploadError('File size must be less than 100MB')
        return
      }

      setFile(selectedFile)
    }
  }

  const handleUpload = async () => {
    if (!file || !selectedLanguage) {
      setUploadError('Please select both a file and a language')
      return
    }

    setIsUploading(true)
    setUploadError(null)
    setUploadProgress(0)

    // Simulate upload progress
    const simulateProgress = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(simulateProgress)
          return 100
        }
        return prev + 10
      })
    }, 100)

    // Simulate server response delay
    setTimeout(() => {
      clearInterval(simulateProgress)
      setIsUploading(false)
      setUploadProgress(100)

      // Mock analysis result
      const mockAnalysisResult: AnalysisResult = {
        transcript: 'This is a simulated transcript from your uploaded file.',
        confidenceScore: 87,
        pronunciation: {
          score: 85,
          improvements: ["Focus on 'th' sounds.", 'Improve vowel clarity.'],
        },
        grammar: {
          score: 90,
          corrections: [
            {
              original: 'I has a idea.',
              suggested: 'I have an idea.',
              explanation: 'Corrected subject-verb agreement.',
            },
          ],
        },
        tone: {
          overall: 'Professional',
          metrics: {
            professionalism: 95,
            clarity: 88,
            engagement: 75,
          },
        },
        wordCount: 120,
        speakingPace: 140,
        suggestions: [
          'Use more engaging phrases.',
          'Speak slightly slower for better clarity.',
        ],
      }

      // Set mock analysis result and switch tab
      setAnalysisResult(mockAnalysisResult)
      setActiveTab('results')
    }, 3000) // Simulate a 3-second delay
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100 p-4">
      <Card className="w-full max-w-4xl shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center text-blue-600">
            Upload Audio/Video
          </CardTitle>
          <CardDescription className="text-center text-blue-500">
            Upload your audio or video for comprehensive language analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-4"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">Upload</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
            </TabsList>
            <TabsContent value="upload" className="space-y-4">
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 items-center gap-4">
                  <Label htmlFor="file" className="sr-only">
                    File
                  </Label>
                  <Input
                    id="file"
                    type="file"
                    onChange={handleFileChange}
                    accept="audio/*,video/*"
                    className="cursor-pointer w-full"
                  />
                </div>
                <div className="grid grid-cols-1 items-center gap-4">
                  <Label htmlFor="language" className="sr-only">
                    Language
                  </Label>
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
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0">
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
              </div>
              {uploadError && (
                <div
                  className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
                  role="alert"
                >
                  <strong className="font-bold">Error: </strong>
                  <span className="block sm:inline">{uploadError}</span>
                </div>
              )}
              <div className="flex justify-center">
                <Button
                  onClick={handleUpload}
                  disabled={isUploading || !file || !selectedLanguage}
                  className="w-full"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <UploadIcon className="mr-2 h-4 w-4" />
                      Start Analysis
                    </>
                  )}
                </Button>
              </div>
              {isUploading && (
                <div className="space-y-2">
                  <Progress value={uploadProgress} className="w-full" />
                  <p className="text-sm text-gray-500 text-center">
                    {uploadProgress}% uploaded
                  </p>
                </div>
              )}
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
                          value={analysisResult.confidenceScore}
                          className="w-full"
                        />
                        <span className="text-2xl font-bold text-green-600">
                          {analysisResult.confidenceScore}%
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Pronunciation</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center space-x-2 mb-4">
                          <Progress
                            value={analysisResult.pronunciation.score}
                            className="w-full"
                          />
                          <span className="text-2xl font-bold text-green-600">
                            {analysisResult.pronunciation.score}%
                          </span>
                        </div>
                        <h4 className="font-semibold mb-2">Improvements:</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          {analysisResult.pronunciation.improvements.map(
                            (improvement, idx) => (
                              <li key={idx} className="text-green-600">
                                {improvement}
                              </li>
                            ),
                          )}
                        </ul>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Grammar</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center space-x-2 mb-4">
                          <Progress
                            value={analysisResult.grammar.score}
                            className="w-full"
                          />
                          <span className="text-2xl font-bold text-green-600">
                            {analysisResult.grammar.score}%
                          </span>
                        </div>
                        <h4 className="font-semibold mb-2">Corrections:</h4>
                        <ul className="space-y-2">
                          {analysisResult.grammar.corrections.map(
                            (correction, idx) => (
                              <li
                                key={idx}
                                className="bg-green-100 p-2 rounded"
                              >
                                <p>
                                  <strong className="text-red-500">
                                    {correction.original}
                                  </strong>{' '}
                                  →{' '}
                                  <strong className="text-green-500">
                                    {correction.suggested}
                                  </strong>
                                </p>
                                <p className="text-sm text-green-600">
                                  {correction.explanation}
                                </p>
                              </li>
                            ),
                          )}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Tone Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-lg mb-4 text-green-600">
                        {analysisResult.tone.overall}
                      </p>
                      <div className="grid grid-cols-3 gap-4">
                        {Object.entries(analysisResult.tone.metrics).map(
                          ([key, value]) => (
                            <div key={key} className="text-center">
                              <h5 className="font-semibold mb-2 capitalize text-green-600">
                                {key}
                              </h5>
                              <Progress
                                value={value * 100}
                                className="w-full mb-2"
                              />
                              <span className="text-green-600">
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
                      <div className="text-2xl font-bold mb-2 text-green-600">
                        {analysisResult.speakingPace} words/min
                      </div>
                      <p className="text-sm text-green-500">
                        {analysisResult.speakingPace < 130
                          ? 'Slow'
                          : analysisResult.speakingPace > 160
                            ? 'Fast'
                            : 'Average'}{' '}
                        pace
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Suggestions for Improvement</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {analysisResult.suggestions.map((suggestion, idx) => (
                          <li key={idx} className="flex items-start space-x-2">
                            <Badge variant="secondary" className="mt-0.5">
                              Tip {idx + 1}
                            </Badge>
                            <p className="text-green-600">{suggestion}</p>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <div className="text-center py-10">
                  <FileAudio className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-semibold text-gray-900">
                    No analysis results
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Upload a file to start the analysis
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
