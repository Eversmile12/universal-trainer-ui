import { useState } from "react";

export default function CSVGenerator() {
  const [questions, setQuestions] = useState<string[]>([""]);
  const [answers, setAnswers] = useState<string[]>([""]);

  const handleAddQA = () => {
    setQuestions((prevQuestions) => [...prevQuestions, ""]);
    setAnswers((prevAnswers) => [...prevAnswers, ""]);
  };

  const handleQuestionChange = (index: number, value: string) => {
    setQuestions((prevQuestions) => {
      const updatedQuestions = [...prevQuestions];
      updatedQuestions[index] = value;
      return updatedQuestions;
    });
  };

  const handleAnswerChange = (index: number, value: string) => {
    setAnswers((prevAnswers) => {
      const updatedAnswers = [...prevAnswers];
      updatedAnswers[index] = value;
      return updatedAnswers;
    });
  };

  const handleDeleteQA = (index: number) => {
    setQuestions((prevQuestions) => {
      const updatedQuestions = [...prevQuestions];
      updatedQuestions.splice(index, 1);
      return updatedQuestions;
    });
    setAnswers((prevAnswers) => {
      const updatedAnswers = [...prevAnswers];
      updatedAnswers.splice(index, 1);
      return updatedAnswers;
    });
  };

  const handleDownload = () => {
    // Check if all questions and answers are filled
    const allFilled = questions.every(
      (question, index) => question && answers[index]
    );

    if (!allFilled) {
      alert("Please fill in all the questions and answers before downloading.");
      return;
    }

    // Prepare the CSV content
    let csvContent = "Question,Answer\n";
    questions.forEach((question, index) => {
      const answer = answers[index];
      csvContent += `"${question}","${answer}"\n`;
    });

    // Create a temporary anchor element to trigger the download
    const anchorElement = document.createElement("a");
    anchorElement.href = URL.createObjectURL(
      new Blob([csvContent], { type: "text/csv;charset=utf-8" })
    );
    anchorElement.download = "qa_data.csv";
    anchorElement.click();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {questions.map((question, index) => (
        <div className="flex space-x-4 items-center mb-4" key={index}>
          <input
            className="w-1/2 p-2 border border-gray-300 rounded"
            type="text"
            value={question}
            onChange={(e) => handleQuestionChange(index, e.target.value)}
            placeholder="Question"
          />
          <textarea
            className="w-1/2 p-2 border border-gray-300 rounded resize-none"
            value={answers[index]}
            onChange={(e) => handleAnswerChange(index, e.target.value)}
            placeholder="Answer"
          ></textarea>
          <button
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            onClick={() => handleDeleteQA(index)}
          >
            Delete
          </button>
        </div>
      ))}

      <div className="flex justify-center space-x-4 mb-8">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          onClick={handleAddQA}
        >
          Add Question/Answer
        </button>
        <button
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          onClick={handleDownload}
        >
          Download CSV
        </button>
      </div>
    </div>
  );
}
