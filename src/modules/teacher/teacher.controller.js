import QuizAttemptSchema from "../../../db/models/quiz_attempt.js";
import QuizSchema from "../../../db/models/quiz.js";
import AppError from "../../utils/AppError.js";
import catchAsyncError from "../../handlers/handelAsyncError.js";
import { Op } from 'sequelize';



// Analytics for teacher dashboard
export const getAllQuizzesForStudent= catchAsyncError(async(req,res,next)=>{
    const quizzesCreated = await  QuizSchema.findAll({
        where:{
            userId: req.user.id,
        },
        attributes:[
            'id',
            'published',
            'NumberOfStudent',
            'averageScoreNumber',
            'subjects'
        ]
    });

    // Get total students (attempts) for all quizzes
    const quizIds = quizzesCreated.map(quiz => quiz.id);
    const attemptsCount = await QuizAttemptSchema.count({
        where: {
            quizId: quizIds
        }
    });

    // Get average score from all attempts
    const attempts = await QuizAttemptSchema.findAll({
        where: {
            quizId: quizIds,
            score: { [Op.ne]: null }
        },
        attributes: ['score']
    });

    const totalScore = attempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0);
    const averageScore = attempts.length > 0 ? totalScore / attempts.length : 0;
    const totalQuizzes = quizzesCreated.length;
    const activeQuizzes = quizzesCreated.filter(quiz => quiz.published).length;
    const totalStudents = attemptsCount;

    // Analytics per subject
    const subjects = [...new Set(quizzesCreated.map(quiz => quiz.subjects))];
    const subjectAnalytics = [];

    for (const subject of subjects) {
        const quizIdsForSubject = quizzesCreated.filter(quiz => quiz.subjects === subject).map(quiz => quiz.id);
        const studentCount = await QuizAttemptSchema.count({
            where: {
                quizId: quizIdsForSubject
            },
            distinct: true,
            col: 'userId'
        });
        subjectAnalytics.push({
            subject,
            studentCount
        });
    }

    res.status(200).json({
        status:'success',
        data:{
            totalQuizzes,
            activeQuizzes,
            totalStudents,
            averageScore: parseFloat(averageScore.toFixed(2)),
            subjectAnalytics
        }
    })



})