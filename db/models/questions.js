import { DataTypes } from "sequelize";
import { sequelize } from "../connection.js";
import UserSchema from "./user.js";

const QuestionSchema = sequelize.define(
  "Question",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    questionText: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    options: {
      type: DataTypes.TEXT,
      allowNull: false,
      get() {
        const rawValue = this.getDataValue("options");
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value) {
        this.setDataValue("options", JSON.stringify(value));
      },
    },
    correctAnswer: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
    },
  },
  {
    timestamps: true,
  }
);

QuestionSchema.belongsTo(UserSchema, { foreignKey: "userId" });
UserSchema.hasMany(QuestionSchema, { foreignKey: "userId" });

export default QuestionSchema;
