import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import "../styles/quizList.css";

const API_URL = "http://localhost:5000/api";

const QuizList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [availableQuizzes, setAvailableQuizzes] = useState([]);
  const [attemptedQuizzes, setAttemptedQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAllQuizzes();
  }, []);

  const fetchAllQuizzes = async () => {
    try {
      // Fetch available quizzes
      const availableResponse = await fetch(`${API_URL}/quiz/all`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });

      // Fetch attempted quizzes
      const attemptedResponse = await fetch(`${API_URL}/quiz/attempted`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });

      if (!availableResponse.ok || !attemptedResponse.ok) {
        const availableError = await availableResponse.text();
        const attemptedError = await attemptedResponse.text();
        throw new Error(`Failed to fetch quizzes: ${availableError} - ${attemptedError}`);
      }

      const availableData = await availableResponse.json();
      const attemptedData = await attemptedResponse.json();

      setAvailableQuizzes(availableData);
      setAttemptedQuizzes(attemptedData);
    } catch (err) {
      console.error("Error fetching quizzes:", err);
      setError(err.message || "Failed to load quizzes");
    } finally {
      setLoading(false);
    }
  };

  const handleAttemptQuiz = (quizId) => {
    navigate(`/attempt-quiz/${quizId}`);
  };

  if (loading) {
    return <div className="quiz-list-container">Loading quizzes...</div>;
  }

  if (error) {
    return <div className="quiz-list-container error">{error}</div>;
  }

  return (
    <div className="quiz-list-container">
      <section className="available-quizzes">
        <h2>Available Quizzes</h2>
        {availableQuizzes.length === 0 ? (
          <div className="no-quiz-container">
            <div className="maze-animation"></div>
            <p className="no-quiz-message">No new quizzes available!</p>
            <p className="sub-message">Check back later for new challenges</p>
          </div>
        ) : (
          <div className="quiz-grid">
            {availableQuizzes.map((quiz) => (
              <div key={quiz._id} className="quiz-card">
                <h3>{quiz.title}</h3>
                <p>{quiz.questions.length} Questions</p>
                <button
                  className="attempt-btn"
                  onClick={() => handleAttemptQuiz(quiz._id)}
                >
                  Attempt Quiz
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="attempted-quizzes">
        <h2>Completed Quizzes</h2>
        {attemptedQuizzes.length === 0 ? (
          <div className="no-quiz-container">
            <div className="maze-animation"></div>
            <p className="no-quiz-message">No completed quizzes yet!</p>
            <p className="sub-message">Start attempting quizzes to see your progress here</p>
          </div>
        ) : (
          <div className="quiz-grid">
            {attemptedQuizzes.map((result) => (
              <div key={result.quiz._id} className="quiz-card completed">
                <h3>{result.quiz.title}</h3>
                <div className="score-info">
                  <p className="score">Score: {result.score.toFixed(2)}%</p>
                  <p className="completed-date">
                    Completed: {new Date(result.completedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="mini-chart">
                  <BarChart width={150} height={100} data={[{
                    name: 'Score',
                    value: result.score,
                    fill: result.score >= 70 ? '#4CAF50' : result.score >= 40 ? '#FFC107' : '#f44336'
                  }]}>
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Bar dataKey="value" />
                  </BarChart>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default QuizList;
