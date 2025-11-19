'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface QuizSectionProps {
  questions: QuizQuestion[];
}

export function QuizSection({ questions }: QuizSectionProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const question = questions[currentQuestion];
  const isCorrect = selectedAnswer === question.correctAnswer;

  const handleCheckAnswer = () => {
    setShowResult(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <p className="mb-6 text-sm text-muted-foreground">Test your understanding of this episode.</p>

      <div className="mb-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">{question.question}</h3>
          <span className="text-sm text-muted-foreground">
            Question {currentQuestion + 1} of {questions.length}
          </span>
        </div>

        <div className="space-y-2">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => !showResult && setSelectedAnswer(index)}
              className={`w-full rounded-lg border-2 p-3 text-left transition-all ${
                selectedAnswer === index
                  ? 'border-accent bg-accent/10'
                  : 'border-border hover:border-accent/50'
              } ${showResult ? 'cursor-default' : 'cursor-pointer'}`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                    selectedAnswer === index ? 'border-accent bg-accent/20' : 'border-border'
                  }`}
                >
                  {selectedAnswer === index && <div className="h-2 w-2 rounded-full bg-accent" />}
                </div>
                <span className="text-sm text-foreground">{option}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {showResult && (
        <div className={`mb-6 rounded-lg border-l-4 p-4 ${isCorrect ? 'border-green-500 bg-green-50 dark:bg-green-950' : 'border-red-500 bg-red-50 dark:bg-red-950'}`}>
          <div className="mb-2 flex items-center gap-2">
            {isCorrect ? (
              <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
            ) : (
              <X className="h-5 w-5 text-red-600 dark:text-red-400" />
            )}
            <span className={`font-semibold ${isCorrect ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
              {isCorrect ? 'Correct!' : 'Incorrect'}
            </span>
          </div>
          <p className={`text-sm ${isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {question.explanation}
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <Button
          onClick={handleCheckAnswer}
          disabled={selectedAnswer === null || showResult}
          className="flex-1 bg-accent hover:bg-accent/90"
        >
          {showResult ? 'Checking...' : 'Check Answer'}
        </Button>
        {showResult && currentQuestion < questions.length - 1 && (
          <Button onClick={handleNextQuestion} variant="outline" className="flex-1">
            Next Question
          </Button>
        )}
        {showResult && currentQuestion === questions.length - 1 && (
          <Button onClick={() => window.scrollTo({ top: 0 })} variant="outline" className="flex-1">
            Review
          </Button>
        )}
      </div>
    </div>
  );
}
