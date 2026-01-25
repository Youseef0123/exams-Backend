import { DataTypes } from 'sequelize';
import { sequelize } from '../connection.js';
import UserSchema from './user.js';

const QuizSchema = sequelize.define('Quiz', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    timeLimit: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 20 // in minutes,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        },
    },
    questions: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    },
    published: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    averageScoreNumber:{
        type: DataTypes.FLOAT,
        defaultValue: 0,
        validate:{
            min:0,
            max:100
        }
    },
    NumberOfStudent:{
        type: DataTypes.INTEGER,
        defaultValue:0
    },
   DeadLine:{
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: () => {
        const date = new Date();
        date.setDate(date.getDate() +3);
        return date;
    }
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

QuizSchema.belongsTo(UserSchema, { foreignKey: 'userId' });
UserSchema.hasMany(QuizSchema, { foreignKey: 'userId' });

export default QuizSchema;