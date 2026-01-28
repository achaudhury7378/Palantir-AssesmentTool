import { useState, useEffect, useRef } from 'react';
import { Clock, ArrowRight, RotateCcw, Loader2 } from 'lucide-react';
import { fetchQuizData, type QuizQuestion } from "./fetch_data";

export function Widget() {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [isFrozen, setIsFrozen] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load quiz data from Foundry ontology on component mount
  useEffect(() => {
    const loadQuizData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const quizData = await fetchQuizData();
        
        if (!quizData || quizData.length === 0) {
          throw new Error("No questions found in the ontology");
        }

        setQuestions(quizData);
        setIsTimerActive(true);
        setTimeLeft(60);
        setIsLoading(false);
      } catch (err) {
        console.error("Error loading quiz data:", err);
        setError(err instanceof Error ? err.message : "Failed to load quiz data");
        setIsLoading(false);
      }
    };

    loadQuizData();
  }, []);

  useEffect(() => {
    if (isTimerActive && timeLeft > 0 && !isFrozen) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && !isFrozen) {
      setIsFrozen(true);
      setIsTimerActive(false);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timeLeft, isTimerActive, isFrozen]);

  const handleAnswerSelect = (answer: string) => {
    if (!isFrozen) {
      setSelectedAnswer(answer);
    }
  };

  const handleNext = () => {
    if (selectedAnswer === questions[currentIndex].correctAnswer) {
      setScore(score + 1);
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setTimeLeft(60);
      setIsFrozen(false);
      setSelectedAnswer(null);
      setIsTimerActive(true);
    } else {
      setQuizComplete(true);
      setIsTimerActive(false);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setTimeLeft(60);
    setIsFrozen(false);
    setSelectedAnswer(null);
    setScore(0);
    setQuizComplete(false);
    setIsTimerActive(true);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center">
            <Loader2 className="w-16 h-16 mx-auto text-indigo-600 mb-4 animate-spin" />
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Loading Quiz</h1>
            <p className="text-gray-600">Fetching questions from ontology...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl">⚠️</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Error Loading Quiz</h1>
            <p className="text-red-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (quizComplete) {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Quiz Complete!</h1>
          <div className="text-6xl font-bold text-indigo-600 mb-4">
            {score}/{questions.length}
          </div>
          <p className="text-xl text-gray-600 mb-8">
            You scored {Math.round((score / questions.length) * 100)}%
          </p>
          <button
            onClick={handleRestart}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition flex items-center gap-2 mx-auto"
          >
            <RotateCcw className="w-5 h-5" />
            Restart Quiz
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const options = [
    { label: 'A', text: currentQuestion.optionA },
    { label: 'B', text: currentQuestion.optionB },
    { label: 'C', text: currentQuestion.optionC },
    { label: 'D', text: currentQuestion.optionD },
  ];

  return (
    <div className="w-full h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full">
        <div className="flex justify-between items-center mb-6">
          <div className="text-sm font-semibold text-gray-600">
            Question {currentIndex + 1} of {questions.length}
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
            timeLeft <= 10 ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-indigo-600'
          }`}>
            <Clock className="w-5 h-5" />
            <span className="font-bold text-lg">{timeLeft}s</span>
          </div>
        </div>

        <div className={`transition-opacity ${isFrozen ? 'opacity-50' : 'opacity-100'}`}>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {currentQuestion.question}
          </h2>

          <div className="space-y-3 mb-6">
            {options.map((option) => (
              <button
                key={option.label}
                onClick={() => handleAnswerSelect(option.label)}
                disabled={isFrozen}
                className={`w-full text-left p-4 rounded-lg border-2 transition ${
                  selectedAnswer === option.label
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 hover:border-indigo-300'
                } ${isFrozen ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <span className="font-semibold text-indigo-600 mr-3">{option.label}.</span>
                {option.text}
              </button>
            ))}
          </div>
        </div>

        {isFrozen && (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6 text-center">
            <p className="text-red-600 font-semibold">⏰ Time&apos;s up! Click Next to continue.</p>
          </div>
        )}

        <button
          onClick={handleNext}
          disabled={!isFrozen && !selectedAnswer}
          className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition ${
            isFrozen || selectedAnswer
              ? 'bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {currentIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}