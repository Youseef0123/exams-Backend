import { DataTypes } from "sequelize";
import { sequelize } from "../connection.js";
import UserSchema from "./user.js";

const OTP = sequelize.define("otp", {
  code: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  expiredAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: UserSchema,
      key: "id",
    },
  },
});

UserSchema.hasMany(OTP, { foreignKey: "userId" });
OTP.belongsTo(UserSchema, { foreignKey: "userId" });
export default OTP;
