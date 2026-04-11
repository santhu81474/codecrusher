import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const mockQuestions = [
  { id: 1, text: 'What does React use to increase performance?', options: ['Virtual DOM', 'Real DOM', 'Shadow DOM', 'None of the above'], answer: 'Virtual DOM' },
  { id: 2, text: 'Which hooks is used to manage state in a functional component?', options: ['useEffect', 'useState', 'useContext', 'useReducer'], answer: 'useState' },
  { id: 3, text: 'How do you pass data to a child component?', options: ['Using state', 'Using context', 'Using props', 'Using Redux'], answer: 'Using props' }
];

const SkillTest = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSelect = (option) => {
    setAnswers({ ...answers, [currentQuestion]: option });
  };

  const handleSubmit = async () => {
    setLoading(true);
    let calculatedScore = 0;

    mockQuestions.forEach((q, index) => {
      if (answers[index] === q.answer) {
        calculatedScore += 1;
      }
    });

    try {
      // Mock API call
      // await api.post('/tests/submit', { score: calculatedScore, total: mockQuestions.length });
      setTimeout(() => {
        setScore(calculatedScore);
        setLoading(false);
      }, 500);
    } catch (err) {
      setLoading(false);
      alert('Failed to submit test');
    }
  };

  if (score !== null) {
    return (
      <div style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center' }} className="card">
        <h2 className="page-title">Test Completed!</h2>
        <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--primary)', margin: '2rem 0' }}>
          {score} / {mockQuestions.length}
        </div>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Your score has been updated in your profile.
        </p>
        <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  const question = mockQuestions[currentQuestion];

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div className="flex justify-between items-center mb-2">
        <h1 className="page-title" style={{ marginBottom: 0 }}>React Skill Test</h1>
        <span className="badge">Question {currentQuestion + 1} of {mockQuestions.length}</span>
      </div>

      <div className="card">
        <h3 className="card-title" style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>{question.text}</h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
          {question.options.map((option, idx) => (
            <label key={idx} style={{
              display: 'flex',
              alignItems: 'center',
              padding: '1rem',
              border: `1px solid ${answers[currentQuestion] === option ? 'var(--primary)' : 'var(--border-color)'}`,
              borderRadius: '6px',
              cursor: 'pointer',
              backgroundColor: answers[currentQuestion] === option ? '#EEF2FF' : 'transparent',
              transition: 'all 0.2s'
            }}>
              <input
                type="radio"
                name={`question-${currentQuestion}`}
                value={option}
                checked={answers[currentQuestion] === option}
                onChange={() => handleSelect(option)}
                style={{ marginRight: '1rem' }}
              />
              <span style={{ fontWeight: answers[currentQuestion] === option ? 600 : 400 }}>{option}</span>
            </label>
          ))}
        </div>

        <div className="flex justify-between">
          <button
            className="btn btn-outline"
            onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
            disabled={currentQuestion === 0}
          >
            Previous
          </button>

          {currentQuestion === mockQuestions.length - 1 ? (
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={loading || !answers[currentQuestion]}
            >
              {loading ? 'Submitting...' : 'Submit Test'}
            </button>
          ) : (
            <button
              className="btn btn-primary"
              onClick={() => setCurrentQuestion(prev => Math.min(mockQuestions.length - 1, prev + 1))}
              disabled={!answers[currentQuestion]}
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SkillTest;
