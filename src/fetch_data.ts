import { client } from "./client";
import { QuestionUploaded } from "@custom-widget/sdk";

export interface QuizQuestion {
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
}

export async function fetchQuizData(): Promise<QuizQuestion[]> {
  try {
    const questions: QuizQuestion[] = [];

    // Fetch all QuestionUploaded objects from the ontology
    for await (const obj of client(QuestionUploaded).asyncIter()) {
      // Map ontology object to QuizQuestion interface
      const quizQuestion: QuizQuestion = {
        question: obj.question || "",
        optionA: obj.optionA || "",
        optionB: obj.optionB || "",
        optionC: obj.optionC || "",
        optionD: obj.optionD || "",
        correctAnswer: (obj.answer || "").toString().toUpperCase(),
      };

      // Only add if question has valid content
      if (quizQuestion.question && quizQuestion.correctAnswer) {
        questions.push(quizQuestion);
      }
    }

    console.log(`Loaded ${questions.length} questions from ontology`);
    return questions;
  } catch (error) {
    console.error("Error loading quiz data from ontology:", error);
    throw error;
  }
}
