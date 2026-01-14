import { Sequelize } from "sequelize";

export const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
      },
    },
  }
);

// for production with SSL

export const connectDb = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully");

    await sequelize.sync({ alter: true });
    console.log("✅ Tables synced");
  } catch (error) {
    console.error("❌ DB connection failed:", error.message);
  }
};
