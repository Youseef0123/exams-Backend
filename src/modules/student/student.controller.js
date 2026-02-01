import QuizSchema from "../../../db/models/quiz.js";
import QuizAttemptSchema from "../../../db/models/quiz_attempt.js";
import AppError from "../../utils/AppError.js";
import catchAsyncError from "../../handlers/handelAsyncError.js";
import { Op, Sequelize } from 'sequelize';



// get all quizzes for a student

export const getAllQuizzesForStudent = catchAsyncError(async(req,res,next)=>{
    const quizzes = await QuizSchema.findAll({
        where:{published:true},
        attributes:['id','title','description','timeLimit','questions','questionCount','createdAt','subjects','DeadLine'],
        order:[['createdAt','DESC']]
    });



    if(quizzes.length>0 && typeof quizzes[0].questions==='string'){
        quizzes.forEach(quiz=>{
            quiz.questions=JSON.parse(quiz.questions);
            // Add id to questions if not present
            quiz.questions.forEach((q, index) => {
                if (!q.id) {
                    q.id = index + 1;
                }
            });
        });
    }
    
    
    res.status(200).json({
        status:'success',
        results:quizzes.length,
        data:{
            quizzes,
        }
    })
})


// start a quiz for student
export const startQuizForStudent = catchAsyncError(async(req,res,next)=>{
    if(!req.params.quizId || isNaN(req.params.quizId)){
        return next(new AppError('Please provide a valid quiz ID',400));
    }

    const quiz = await QuizSchema.findOne({
        where:{id:req.params.quizId,published:true},
        attributes:['id','title','description','timeLimit','questions','createdAt'],
    });

    if(!quiz){
        return next(new AppError('Quiz not found or not published',404));
    }

    // Check if student has already attempted this quiz
    const existingAttempt = await QuizAttemptSchema.findOne({
        where: { quizId: req.params.quizId, userId: req.user.id }
    });

    if (existingAttempt) {
        return next(new AppError('You have already attempted this quiz. You can only take it once.', 400));
    }

    if(typeof quiz.questions==='string'){
        quiz.questions=JSON.parse(quiz.questions);
    }

    // Add id to questions if not present
    quiz.questions.forEach((q, index) => {
        if (!q.id) {
            q.id = index + 1;
        }
    });

    const startTime = new Date();

    // Create quiz attempt
    const attempt = await QuizAttemptSchema.create({
        quizId: req.params.quizId,
        userId: req.user.id,
        startTime: startTime
    });

    // Increment NumberOfStudent
    await QuizSchema.increment('NumberOfStudent', { where: { id: req.params.quizId } });

    console.log('Attempt created for Quiz ID:', req.params.quizId, 'User ID:', req.user.id, 'Attempt ID:', attempt.id);

    res.status(200).json({
        status:'success',
        data:{
            quiz,
            startTime
        }
    })


})

// submit quiz answers
export const submitQuiz=catchAsyncError(async(req,res,next)=>{
    // Validate input is now handled by middleware

    const {quizId,answers}=req.body;

    const quiz = await QuizSchema.findOne({
        where:{id:quizId,published:true},
        attributes:['id','title','description','timeLimit','questions','createdAt'],
    })

    if(!quiz){
        return next(new AppError('Quiz not found or not published',404));
    }

    // Find the quiz attempt
    const attempt = await QuizAttemptSchema.findOne({
        where: { quizId: quizId, userId: req.user.id },
        order: [['createdAt', 'DESC']]
    });

    console.log('Quiz ID:', quizId, 'User ID:', req.user.id, 'Attempt found:', !!attempt);

    if (!attempt) {
        return next(new AppError('No quiz attempt found. Please start the quiz first.', 400));
    }

    let questions=quiz.questions;
    if(typeof questions==='string'){
        questions=JSON.parse(questions);
    }

    // Add id to questions if not present
    questions.forEach((q, index) => {
        if (!q.id) {
            q.id = index + 1;
        }
    });

    // calculate time 
    const endTime = new Date();
    const timeTaken = Math.round((endTime - new Date(attempt.startTime)) / 1000 / 60); 
    if(quiz.timeLimit>0 && timeTaken>quiz.timeLimit){
        return next(new AppError('Time limit exceeded for this quiz',400));
    }   

    //correct answers and calculate score
    let correctCount=0;
    const wrongAnswers=[];
    const totalQuestions=questions.length;

    answers.forEach(([questionId, answer]) => {
        const question=questions.find(q=>q.id===questionId);
        if(question){
            if(question.correctAnswer===answer){
                correctCount++;
            }else{
                wrongAnswers.push({questionId:question.id,correctAnswer:question.correctAnswer});
            }
        }
    })

    const score=totalQuestions>0 ? parseFloat(((correctCount/totalQuestions)*100).toFixed(1)) : 0;
    const grade = score >= 80 ? 'A' : score >= 60 ? 'B' : score >= 40 ? 'C' : 'F';
     
    const newNumberOfStudent=quiz.NumberOfStudent+1;
    const newAverageScore=((quiz.averageScoreNumber * quiz.NumberOfStudent) + score) / newNumberOfStudent;

    await QuizSchema.update({
        averageScoreNumber:newAverageScore,
        NumberOfStudent:newNumberOfStudent
    },{
        where:{id:quizId}
    })

    // Update the attempt
    await QuizAttemptSchema.update({
        submittedAt: endTime,
        score: score,
        grade: grade,
        timeTaken: timeTaken,
        wrongAnswers: wrongAnswers
    }, {
        where: { id: attempt.id }
    });

    res.status(200).json({
        status:'success',
        data:{
            score,
            grade,
            wrongAnswers,
            timeTaken,
            timeLimit:quiz.timeLimit
        }
    })

})


// Analytics for student dashboard

export const getStudentAnalytics= catchAsyncError(async(req,res,next)=>{
    const attempts = await QuizAttemptSchema.findAll({
        where:{
            userId: req.user.id,
        }
    })

    

    // Helper function to get start of week (Saturday)
    const getStartOfWeek = (date) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - ((day + 1) % 7);
        return new Date(d.setDate(diff));
    };

    const now = new Date();
    const currentWeekStart = getStartOfWeek(now);
    const previousWeekStart = new Date(currentWeekStart);
    previousWeekStart.setDate(previousWeekStart.getDate() - 7);

    const currentWeekAttempts = attempts.filter(attempt => {
        if (!attempt.submittedAt) return false;
        const submittedAt = new Date(attempt.submittedAt);
        return submittedAt >= currentWeekStart;
    });

    const previousWeekAttempts = attempts.filter(attempt => {
        if (!attempt.submittedAt) return false;
        const submittedAt = new Date(attempt.submittedAt);
        return submittedAt >= previousWeekStart && submittedAt < currentWeekStart;
    });

    const currentAvg = currentWeekAttempts.length > 0 ? currentWeekAttempts.reduce((sum, a) => sum + (a.score || 0), 0) / currentWeekAttempts.length : 0;
    const previousAvg = previousWeekAttempts.length > 0 ? previousWeekAttempts.reduce((sum, a) => sum + (a.score || 0), 0) / previousWeekAttempts.length : 0;
    const weeklyProgress = parseFloat((currentAvg - previousAvg).toFixed(2));
    const isIncreasing = weeklyProgress > 0;

    // Calculate daily quizzes for current week
    const daysOfWeek = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const dailyQuizzes = {};
    daysOfWeek.forEach(day => dailyQuizzes[day] = 0);

    currentWeekAttempts.forEach(attempt => {
        if (attempt.submittedAt) {
            const submittedAt = new Date(attempt.submittedAt);
            const dayIndex = submittedAt.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
            const ourDayIndex = (dayIndex + 1) % 7; // Sat=0, Sun=1, Mon=2, ..., Fri=6
            const dayName = daysOfWeek[ourDayIndex];
            dailyQuizzes[dayName]++;
        }
    });

    const totalQuizzesAttempted = attempts.length;
    const totalScore = attempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0);
    const averageScore = attempts.length > 0 ? totalScore / attempts.length : 0;
    const highestScore = attempts.reduce((max,attempts)=>{ return attempts.score > max ? attempts.score : max },0);


    res.status(200).json({
        status:'success',
        data:{
            totalQuizzesAttempted,
            averageScore: parseFloat(averageScore.toFixed(2)),
            highestScore,
            weeklyProgress,
            isIncreasing,
            dailyQuizzes
        }
    })

});


//upcoming DeadLines 
export const getUpcomingDeadlines= catchAsyncError(async(req,res,next)=>{
    const quizzes = await QuizSchema.findAll({
        where: {
            published: true,
            DeadLine: {
                [Op.gte]: new Date()
            }
        },
        order: [['DeadLine', 'ASC']],
        attributes: ['id', 'title', 'description', 'DeadLine']
    })

    if(!quizzes || quizzes.length===0){
        return next(new AppError("No upcoming deadlines found" ,404))
    }


});



// get completed quizzes for student
export const getCompletedQuizzesForStudent = catchAsyncError(async(req,res,next)=>{
    const attempts = await QuizAttemptSchema.findAll({
        where: {
            userId: req.user.id,
            submittedAt: { [Op.ne]: null }
        },
        include: [{
            model: QuizSchema,
            attributes: ['title', 'subjects']
        }],
        attributes: ['submittedAt', 'score'],
        order: [['submittedAt', 'DESC']]
    });

    const completedQuizzes = attempts.map(attempt => ({
        title: attempt.Quiz.title,
        subjects: attempt.Quiz.subjects,
        dateCompleted: attempt.submittedAt,
        score: attempt.score
    }));

    const totalQuizzes = completedQuizzes.length;
    const highestScore = completedQuizzes.length > 0 ? Math.max(...completedQuizzes.map(q => q.score)) : 0;
    const averageScore = completedQuizzes.length > 0 ? completedQuizzes.reduce((sum, q) => sum + q.score, 0) / completedQuizzes.length : 0;

    // Extract last quiz and best result
    const lastQuiz = completedQuizzes.length > 0 ? completedQuizzes[0] : null;
    const bestResult = highestScore;

    res.status(200).json({
        status: 'success',
        results: completedQuizzes.length,
        data: {
            completedQuizzes,
            totalQuizzes,
            highestScore,
            averageScore: parseFloat(averageScore.toFixed(2)),
            lastQuiz,
            bestResult
        }
    });
});



