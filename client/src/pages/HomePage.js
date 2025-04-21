import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Clock, Users, Shield, PlusCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "../styles/home.css";

const Home = () => {
  const { user } = useAuth(); // ✅ Check logged-in user

  return (
    <div className="home-container">
      {/* ✅ Hero Section */}
      <motion.h1
        className="hero-title"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        Welcome to <span className="highlight">Quiz Portal</span>
      </motion.h1>

      {/* ✅ Cards Section */}
      <div className="cards-container">
        <motion.div className="card" whileHover={{ scale: 1.05 }}>
          <BookOpen size={40} />
          <h3>Wide Variety of Quizzes</h3>
          <p>Choose from multiple categories and challenge yourself.</p>
        </motion.div>

        <motion.div className="card" whileHover={{ scale: 1.05 }}>
          <Clock size={40} />
          <h3>Time-Based Challenges</h3>
          <p>Test your speed and accuracy with timed quizzes.</p>
        </motion.div>

        <motion.div className="card" whileHover={{ scale: 1.05 }}>
          <Users size={40} />
          <h3>Compete with Friends</h3>
          <p>Compare scores and climb the leaderboard.</p>
        </motion.div>

        <motion.div className="card" whileHover={{ scale: 1.05 }}>
          <Shield size={40} />
          <h3>Secure & Fair</h3>
          <p>Ensuring a cheat-free and fair quiz experience.</p>
        </motion.div>
      </div>

      {/* ✅ Buttons */}
      <motion.div className="btn-container">
        <Link to="/quiz" className="start-quiz-btn">
          Start Quiz
        </Link>

        {/* ✅ Show "Create Quiz" button only if user is ADMIN */}
        {user && user.role === "admin" && (
          <Link to="/create-quiz" className="create-quiz-btn">
            <PlusCircle size={20} />
            Create Quiz
          </Link>
        )}
      </motion.div>
    </div>
  );
};

export default Home;
