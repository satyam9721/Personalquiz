import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Form, Modal } from 'react-bootstrap';
import QuizResult from '../QuizResult/QuizResult';
import { Link } from 'react-router-dom';
import { MDBContainer, MDBRating } from 'mdbreact';
import "./style.css";
function Quizdisplay() {

  const [quizData, setQuizData] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [showPopUp, setShowPopUp] = useState(false);
  const [questionsAnswered, setQuestionsAnswered] = useState([]);

  const handleOptionSelect = (questionId, value) => {
    setSelectedOptions({ ...selectedOptions, [questionId]: value });
  };

  useEffect(() => {
    // Make an API request using Axios
    axios.get('http://localhost:3001/api/quiz')
      .then((response) => {
        // Extract the data from the API response
        setQuizData(response.data);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, []);

  // const handleNextPage = () => {

 
  //   const currentQuestion = quizData[currentPage];

  //   if (selectedOptions[currentQuestion._id] !== undefined) {
  //     setCurrentPage(currentPage + 1);
  //     setQuestionsAnswered([...questionsAnswered, currentQuestion._id]);
  //   } else {
  //     // Show the pop-up if no option is selected
  //     setShowPopUp(true);
  //   }
  // };

  const handlePreviousPage = () => {
    setCurrentPage(currentPage - 1);
  };

  const resetAll = () => {
    setCurrentPage(0);
    setSelectedOptions({});
    setShowPopUp(false);
    setQuestionsAnswered([]);
  };

  const allQuestionsAnswered = quizData.every(question => questionsAnswered.includes(question._id));


//important logic for local storage and move to next page aswell
  const handleSubmit = (e) => {
  e.preventDefault();

  const question = quizData[currentPage];

  if (Array.isArray(question.answers)) {
    // Handle multiple-choice questions
    let selectedAnswer = '';
    let selectedWeightage = '';

    question.answers.forEach((answer, index) => {
      const inputElement = document.getElementById(`radioOption-${question._id}-${index}`);
      if (inputElement.checked) {
        selectedAnswer = answer.text;
        selectedWeightage = answer.weightage;
      }
    });

    if (selectedAnswer === '' || selectedWeightage === '') {
      // Show the pop-up if no option is selected
      setShowPopUp(true);
      return;
    }

    // Save selected answer and weightage to localStorage under a dynamic key
    localStorage.setItem(`selectedAnswer_${question.index}`, selectedAnswer);
    localStorage.setItem(`selectedWeightage_${question.index}`, selectedWeightage);
  } else {
    // Handle slider/range questions
    const selectedValue = selectedOptions[question._id];

    if (selectedValue === undefined) {
      // Show the pop-up if no option is selected
      setShowPopUp(true);
      return;
    }

    // Save selected weightage to localStorage under a dynamic key
    localStorage.setItem(`selectedWeightage_${question.index}`, selectedValue);
  }

  // Save common data to localStorage
  localStorage.setItem(`index_${question.index}`, question.index);
  localStorage.setItem(`section_${question.index}`, question.section);
  localStorage.setItem(`question_${question.index}`, question.question);

  // Handle navigation to the next question
  if (currentPage < quizData.length - 1) {
    setCurrentPage(currentPage + 1);
  }
};


  
  
  

  return (
    <div className="wrapper pt-2 mt-4">
      <h1 className="text-center">MetaGrowth </h1>

      {currentPage === quizData.length - 1 ? (
        <QuizResult totalscore={quizData.length} tryAgain={resetAll} />
      ) : (
        <div className="wrapper mt-5">
          <ul className="list-group">
            {quizData.slice(currentPage, currentPage + 1).map((question) => (
              <li key={question._id} className="wrapper list-group-item">
                
                <span className="d-flex justify-content-center align-items-center mt-3 ">Section: {question.section}</span>
                {/* <p className="h5"> {question.index}</p> */}

                <h3 className=" text-center mb-3 mt-4">{question.question}</h3>

                <div className="form_items mt-5 ">
                  {Array.isArray(question.answers) ? (
                    question.answers.map((answer, index) => (
                      
                      <div key={index} className="form-check mb-3">
                        <li>
                        <input
                          className="form-check-input "
                          type="radio"
                          name={`radioOptions-${question._id}`}
                          id={`radioOption-${question._id}-${index}`}
                          value={answer.weightage}
                          checked={selectedOptions[question._id] === answer.weightage}
                          onChange={() => handleOptionSelect(question._id, answer.weightage)}
                        />
                        <label
                          className="form-check-label ml-2"
                          htmlFor={`radioOption-${question._id}-${index}`}
                        >
                          {answer.text}
                        </label>
                        </li>
                      </div>
                      
                    ))
                  ) : (
                    <div className='d-flex justify-content-center mt-2'>
                    <form onInput="result.value = slider.value">
                      <label className="mb-3">
                        Rate from {question.answers.min} to {question.answers.max}
                      </label>
                      {/* <b-form-rating v-model="value" variant="warning" className="mb-2"></b-form-rating> */}
                     
                      <input
                        type="range"
                        min={question.answers.min}
                        max={question.answers.max}
                        step={question.answers.step}
                        value={selectedOptions[question._id] || question.answers.min}
                        onChange={(e) =>
                          handleOptionSelect(question._id, parseFloat(e.target.value))
                        }
                      />
                      <output className="mt-2" name="result" for="slider">
                        {question.answers.step}
                      </output>
                    </form>
                    </div>
                  )}
                </div>
                <div className='d-flex justify-content-center mt-5'>
                <Button
              variant="warning"
              className="f_btn text-uppercase rounded-pill border-0 "
              onClick={handlePreviousPage}
              disabled={currentPage === 0}
            >
              Previous 
            </Button>
            <Button
              variant="warning"
              className="f_btn text-uppercase rounded-pill border-0"
              
              onClick={handleSubmit}
            >
              Next
            </Button>
            </div>

              </li>
            ))}
          </ul>
        
            
            {/* <Button onClick={handleSubmit}>Save</Button> */}
          
        </div>
      )}
      <Modal show={showPopUp} onHide={() => setShowPopUp(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Select an Option</Modal.Title>
        </Modal.Header>
        <Modal.Body>Please select an option before proceeding.</Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => setShowPopUp(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Quizdisplay;
