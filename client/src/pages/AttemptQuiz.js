import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import "../styles/attemptQuiz.css";

const API_URL = "http://localhost:5000/api";

const AttemptQuiz = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchQuiz();
  }, [id, user?.token]); // Added dependencies

  const fetchQuiz = async () => {
    try {
      const response = await fetch(`${API_URL}/quiz/${id}`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch quiz");
      }

      const data = await response.json();
      setQuiz(data);
      setAnswers(new Array(data.questions.length).fill(null));
      setLoading(false);
    } catch (err) {
      console.error("Error fetching quiz:", err);
      setError("Failed to load quiz");
      setLoading(false);
    }
  };

  const handleAnswerSelect = (selectedOption) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = selectedOption;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateScore = () => {
    let correctAnswers = 0;
    quiz.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correctAnswers++;
      }
    });
    return (correctAnswers / quiz.questions.length) * 100;
  };

  const handleSubmit = async () => {
    const finalScore = calculateScore();
    setScore(finalScore);

    // Save the quiz result
    try {
      const response = await fetch(`${API_URL}/quiz/${id}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({
          answers,
          score: finalScore,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit quiz");
      }

      setShowResults(true);
    } catch (err) {
      console.error("Error saving quiz result:", err);
      setError("Failed to submit quiz. Please try again.");
    }
  };

  if (loading) {
    return <div className="quiz-attempt-container">Loading quiz...</div>;
  }

  if (error) {
    return <div className="quiz-attempt-container error">{error}</div>;
  }

  if (!quiz) {
    return <div className="quiz-attempt-container">Quiz not found</div>;
  }

  if (showResults) {
    const graphData = [
      {
        name: "Your Score",
        score: score,
        fill: "#8884d8",
      },
      {
        name: "Maximum Score",
        score: 100,
        fill: "#82ca9d",
      },
    ];

    return (
      <div className="quiz-results-container">
        <h2>Quiz Results</h2>
        <div className="score-info">
          <p>Your Score: {score.toFixed(2)}%</p>
          <p>Total Questions: {quiz.questions.length}</p>
          <p>Correct Answers: {Math.round((score * quiz.questions.length) / 100)}</p>
        </div>
        
        <div className="score-graph">
          <BarChart width={600} height={300} data={graphData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Legend />
            <Bar dataKey="score" name="Score %" />
          </BarChart>
        </div>

        <div className="answer-review">
          <h3>Review Your Answers</h3>
          {quiz.questions.map((question, index) => (
            <div key={index} className={`answer-item ${answers[index] === question.correctAnswer ? "correct" : "incorrect"}`}>
              <p><strong>Question {index + 1}:</strong> {question.text}</p>
              <p>Your Answer: {answers[index] || "Not answered"}</p>
              <p>Correct Answer: {question.correctAnswer}</p>
            </div>
          ))}
        </div>

        <button className="quiz-btn" onClick={() => navigate("/quiz")}>
          Back to Quiz List
        </button>
      </div>
    );
  }

  return (
    <div className="quiz-attempt-container">
      <h2>{quiz.title}</h2>
      <div className="progress-bar">
        <div 
          className="progress" 
          style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
        ></div>
      </div>
      <p className="question-counter">
        Question {currentQuestion + 1} of {quiz.questions.length}
      </p>

      <div className="question-card">
        <h3>{quiz.questions[currentQuestion].text}</h3>
        <div className="options">
          {quiz.questions[currentQuestion].options.map((option, index) => (
            <button
              key={index}
              className={`option-btn ${answers[currentQuestion] === option ? "selected" : ""}`}
              onClick={() => handleAnswerSelect(option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="navigation-buttons">
        <button 
          className="quiz-btn" 
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
        >
          Previous
        </button>
        {currentQuestion === quiz.questions.length - 1 ? (
          <button 
            className="quiz-btn submit" 
            onClick={handleSubmit}
            disabled={answers.includes(null)}
          >
            Submit Quiz
          </button>
        ) : (
          <button 
            className="quiz-btn" 
            onClick={handleNext}
            disabled={answers[currentQuestion] === null}
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
};

export default AttemptQuiz;
