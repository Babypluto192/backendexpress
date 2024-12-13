export const Settings =  {
  MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017",
  JWT_SECRET_ACCESS: process.env.JWT_SECRET || "abc", 
  JWT_SECRET_REFRESH: process.env.REFRESH_SECRET || '123',
  CLIENT_ID: "25191046053-0uak91k6d34o58pr0udr8fnef2888b4s.apps.googleusercontent.com",
  CLIENT_SECRET: "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",
  GOOGLE_REFRESH_TOKEN: "1//04FI7kHTYwi_0CgYIARAAGAQSNwF-L9IrS9ZJ-Lqf4sINQnVB864aTkYXVM1emAzh7sCZiO_LKNNJJa7GqkxfIG8fJMX5AxIEqMQ"
}