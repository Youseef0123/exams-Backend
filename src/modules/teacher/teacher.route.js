import {Router} from 'express';
import {getAllQuizzesForStudent}    from "./teacher.controller.js";
import {protect,restrictTo} from "../../middleware/auth.js";



const TeacherRouter = Router();

TeacherRouter.use(protect);

// get teacher dashboard 
TeacherRouter.get("/dashboard",restrictTo('teacher') , getAllQuizzesForStudent)




export default TeacherRouter