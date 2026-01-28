import QuizSchema from "../../../db/models/quiz.js";
import AppError from "../../utils/AppError.js";
import catchAsyncError from "../../handlers/handelAsyncError.js";
import { QUIZ_CATEGORIES } from "../../utils/quizCategories.js";


// create quiz
export const createQuiz= catchAsyncError(async(req,res ,next)=>{
  const {title,description,subjects,timeLimit,questions, DeadLine} = req.body;

  const newQuiz =await QuizSchema.create({
    title,
    description,
    subjects,
    timeLimit,
    questions,
    userId: req.user.id,
    DeadLine: DeadLine


  })

  // Parse questions if stored as string
  if (typeof newQuiz.questions === 'string') {
    newQuiz.questions = JSON.parse(newQuiz.questions);
  }

  res.status(201).json({
    status:"success",
    data:{quiz:newQuiz},
  })

})


// get all quizzes for teacher
export const getAllQuizzes = catchAsyncError(async(req, res ,next)=>{
  const quizzes = await QuizSchema.findAll({
    where:{userId: req.user.id},
    attributes:['id','title','description','subjects','timeLimit','published','averageScoreNumber','NumberOfStudent','createdAt','questions'],
    order:[['id','ASC']]
  })

  // Parse questions if they are stored as strings
  quizzes.forEach(quiz => {
    if (typeof quiz.questions === 'string') {
      quiz.questions = JSON.parse(quiz.questions);
    }
  });

  res.status(200).json({
    status:"success",
    results: quizzes.length,
    data:{quizzes},
  })
})


//get Quiz by id
export const getQuizById = catchAsyncError(async(req, res ,next)=>{
  if (!req.params.id || isNaN(req.params.id)) {
    return next(new AppError('Invalid quiz ID', 400));
  }

  const Quiz= await QuizSchema.findOne({
    where:{
      id:req.params.id,
      userId:req.user.id
    }
  })
  if(!Quiz){
   return next(new AppError('No quiz found with that ID or not owned by you', 404));
  }

  // Parse questions if stored as string
  if (typeof Quiz.questions === 'string') {
    Quiz.questions = JSON.parse(Quiz.questions);
  }

  res.status(200).json({
    status:"success",
    data:{Quiz},
  })
})


// update quiz by teacher only
export const updateQuiz= catchAsyncError(async(req,res, next)=>{
  if (!req.params.id || isNaN(req.params.id)) {
    return next(new AppError('Invalid quiz ID', 400));
  }

  const quiz= await QuizSchema.findOne({
    where:{
      id:req.params.id,
      userId:req.user.id
    }
  });

  if(!quiz){
    return next(new AppError('No quiz found with that ID or not owned by you', 404));
  }

  const {title,description,subjects,timeLimit,questions} = req.body;
  quiz.title= title || quiz.title;
  quiz.description= description || quiz.description;
  quiz.subjects= subjects || quiz.subjects;
  quiz.timeLimit= timeLimit || quiz.timeLimit;
  quiz.questions= questions || quiz.questions;
  await quiz.save();

  // Parse questions if stored as string
  if (typeof quiz.questions === 'string') {
    quiz.questions = JSON.parse(quiz.questions);
  }

  res.status(200).json({
    status:"success",
    data:{quiz},
  })
})


// delete quiz
export const deleteQuiz = catchAsyncError(async(req,res,next)=>{
  if (!req.params.id || isNaN(req.params.id)) {
    return next(new AppError('Invalid quiz ID', 400));
  }

  const quiz=await QuizSchema.findOne({
    where:{
      id:req.params.id,
      userId:req.user.id
    }
  })
  if(!quiz){
    return next(new AppError('No quiz found with that ID or not owned by you', 404));
  }

  await quiz.destroy();
  res.status(200).json({
    status:"success",
    message: 'Quiz deleted successfully',
    })
})

// get all available quiz categories
export const getQuizCategories = catchAsyncError(async(req, res, next) => {
  res.status(200).json({
    status: 'success',
    results: QUIZ_CATEGORIES.length,
    data: {
      categories: QUIZ_CATEGORIES
    }
  });
});

// make quiz published or unpublished
export const togglePublish = catchAsyncError(async(req,res,next)=>{
  if (!req.params.id || isNaN(req.params.id)) {
    return next(new AppError('Invalid quiz ID', 400));
  }

  const quiz = await QuizSchema.findOne({
    where:{
      id:req.params.id,
      userId:req.user.id
    }
  })

  if(!quiz){

    return next(new AppError('No quiz found with that ID or not owned by you', 404));

  }

  quiz.published=!quiz.published
  await quiz.save()

  // Parse questions if stored as string
  if (typeof quiz.questions === 'string') {
    quiz.questions = JSON.parse(quiz.questions);
  }

  res.status(200).json({
    status:'success',
    data:{quiz}
  })
})

