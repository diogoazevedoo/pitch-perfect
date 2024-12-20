import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Brain, Mic } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-100 to-gray-200 p-4">
      <div className="max-w-4xl w-full space-y-8">
        <div className="flex justify-center mb-8">
          <Image
            src="/images/image.png"
            alt="Pitch Perfect Logo"
            width={450}
            height={450}
            className="rounded-lg"
          />
        </div>
        <p className="text-xl text-center text-gray-600 mb-10">
          Speak like a pro, nail every presentation!
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          {[
            {
              title: 'Language Correction',
              description: 'Practice in real-time with AI feedback',
              icon: Mic,
              color: 'bg-green-600 hover:bg-green-700',
              action: 'Practice live',
              destination: '/live',
            },
            {
              title: 'Context Based Correction',
              description: 'Improve with tailored scenarios',
              icon: Brain,
              color: 'bg-purple-600 hover:bg-purple-700',
              action: 'Practice with context',
              destination: '/practice',
            },
          ].map((item, index) => (
            <Card
              key={index}
              className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col"
            >
              <CardHeader>
                <CardTitle className="text-2xl font-semibold text-gray-800">
                  {item.title}
                </CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow flex items-end">
                <Link href={item.destination} passHref className="w-full">
                  <Button className={`w-full ${item.color} text-white`}>
                    <item.icon className="mr-2 h-5 w-5" /> {item.action}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
