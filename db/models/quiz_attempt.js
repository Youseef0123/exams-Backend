import { DataTypes } from 'sequelize';
import { sequelize } from '../connection.js';
import UserSchema from './user.js';
import QuizSchema from './quiz.js';

const QuizAttemptSchema = sequelize.define('QuizAttempt', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    quizId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Quizzes',
            key: 'id'
        },
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        },
    },
    startTime: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    submittedAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    score: {
        type: DataTypes.FLOAT,
        allowNull: true,
        validate: {
            min: 0,
            max: 100
        }
    },
    grade: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    timeTaken: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    wrongAnswers: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
});

QuizAttemptSchema.belongsTo(UserSchema, { foreignKey: 'userId' });
UserSchema.hasMany(QuizAttemptSchema, { foreignKey: 'userId' });

QuizAttemptSchema.belongsTo(QuizSchema, { foreignKey: 'quizId' });
QuizSchema.hasMany(QuizAttemptSchema, { foreignKey: 'quizId' });

export default QuizAttemptSchema;