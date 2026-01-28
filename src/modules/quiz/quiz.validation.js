

import { QUIZ_CATEGORIES } from '../../utils/quizCategories.js';

const validateCreateQuiz=(req,res,next)=>{
    const {title,description,subjects,timeLimit,questions} = req.body;
    const errors = [];



    if(!title || title.trim().length<3){
        errors.push("Title is required and should be at least 3 characters long.");

    }

    if(!description || description.trim().length<10){
        errors.push("Description is required and should be at least 10 characters long.");
    }

    if(!subjects || typeof subjects !== 'string' || subjects.trim().length < 2){
        errors.push("Subject is required and should be at least 2 characters long.");
    } else if (!QUIZ_CATEGORIES.includes(subjects.trim())) {
        errors.push(`Subject must be one of the following: ${QUIZ_CATEGORIES.join(', ')}`);
    }

    if(!timeLimit || timeLimit<=0){
        errors.push("Time limit is required and should be a positive number.");
    }

    if(!questions || !Array.isArray(questions) || questions.length===0){
        errors.push("Questions are required  , at least add one question.");
    }else {
    questions.forEach((q, index) => {
      if (!q.text || q.text.trim().length < 5) {
        errors.push(`Question ${index + 1}: Text must be at least 5 characters.`);
      }
      if (!['multi-choice', 'true-false'].includes(q.type)) {
        errors.push(`Question ${index + 1}: Type must be 'multi-choice' or 'true-false'.`);
      }
      if (q.type === 'multi-choice') {
        if (!q.options || !Array.isArray(q.options) || q.options.length < 2) {
          errors.push(`Question ${index + 1}: Multi-choice must have at least 2 options.`);
        }
        if (!q.correctAnswer || !q.options.includes(q.correctAnswer)) {
          errors.push(`Question ${index + 1}: Correct answer must be one of the options.`);
        }
      } else if (q.type === 'true-false') {
        if (typeof q.correctAnswer !== 'boolean') {
          errors.push(`Question ${index + 1}: True-false correct answer must be true or false.`);
        }
      }
    });
  }

  if(errors.length>0){
    return res.status(400).json({
        status:"failed",
        errors: errors
    });
  }
 
    next();


};


const validateUpdateQuiz=(req,res,next)=>{
    const {title,description,subjects,timeLimit,questions} = req.body;
    const errors = [];



    if(!title || title.trim().length<3){
        errors.push("Title is required and should be at least 3 characters long.");

    }

    if(!description || description.trim().length<10){
        errors.push("Description is required and should be at least 10 characters long.");
    }

    if(!subjects || typeof subjects !== 'string' || subjects.trim().length < 2){
        errors.push("Subject is required and should be at least 2 characters long.");
    } else if (!QUIZ_CATEGORIES.includes(subjects.trim())) {
        errors.push(`Subject must be one of the following: ${QUIZ_CATEGORIES.join(', ')}`);
    }

    if(!timeLimit || timeLimit<=0){
        errors.push("Time limit is required and should be a positive number.");
    }

    if(!questions || !Array.isArray(questions) || questions.length===0){
        errors.push("Questions are required  , at least add one question.");
    }else {
    questions.forEach((q, index) => {
      if (!q.text || q.text.trim().length < 5) {
        errors.push(`Question ${index + 1}: Text must be at least 5 characters.`);
      }
      if (!['multi-choice', 'true-false'].includes(q.type)) {
        errors.push(`Question ${index + 1}: Type must be 'multi-choice' or 'true-false'.`);
      }
      if (q.type === 'multi-choice') {
        if (!q.options || !Array.isArray(q.options) || q.options.length < 2) {
          errors.push(`Question ${index + 1}: Multi-choice must have at least 2 options.`);
        }
        if (!q.correctAnswer || !q.options.includes(q.correctAnswer)) {
          errors.push(`Question ${index + 1}: Correct answer must be one of the options.`);
        }
      } else if (q.type === 'true-false') {
        if (typeof q.correctAnswer !== 'boolean') {
          errors.push(`Question ${index + 1}: True-false correct answer must be true or false.`);
        }
      }
    });
  }

  if(errors.length>0){
    return res.status(400).json({
        status:"failed",
        errors: errors
    });
  }
 
    next();


};


export {validateCreateQuiz,validateUpdateQuiz};