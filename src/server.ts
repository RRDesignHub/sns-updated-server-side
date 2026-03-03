import app from "./app";
import { config } from "./config/config";
import connectDB from "./config/db.config";

const port = config.port || 3000;

const startServer = async () => {
  try {
    await connectDB();

    if (config.nodeEnv !== "production") {
      app.listen(port, () =>
        console.log(`Server listening on "http://localhost:${port}`),
      );
    }
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

startServer();
// Export app for Vercel serverless
export default app;
