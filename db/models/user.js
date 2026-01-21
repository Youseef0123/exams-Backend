import { DataTypes } from "sequelize";
import { sequelize } from "../connection.js";
import bcrypt from "bcryptjs";

const UserSchema = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Institution:{
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,

    },
    bio:{
     type:DataTypes.TEXT,
     allowNull:true,
     defaultValue:null,
    },
    role: {
      type: DataTypes.ENUM("teacher", "user"),
      defaultValue: "user",
    },
  },
  {
    timestamps: true,
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed("password")) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
    },
  }
);

UserSchema.prototype.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export { UserSchema };
export default UserSchema;
