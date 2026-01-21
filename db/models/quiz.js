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
        defaultValue: 0,
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