const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

dotenv.config();

const connectDatabase = require("./config/db");

// ROUTES
const authRoutes = require("./routes/auth");
const issueRoutes = require("./routes/issues");
const commentRoutes = require("./routes/comments");
const attachmentRoutes = require("./routes/attachments");
const attachmentSigned = require("./routes/attachmentSigned");
const userRoutes = require("./routes/users");
const voteRoutes = require("./routes/votes");

// MIDDLEWARE
const errorHandler = require("./middleware/errorHandler");

const app = express();

/* ---------------- CORS ---------------- */

app.use(cors({
  origin: true,
  credentials: true
}));

/* ---------------- BODY PARSER ---------------- */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ---------------- SECURITY ---------------- */

app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(mongoSanitize());

/* ---------------- STATIC UPLOADS ---------------- */

const uploadDir =
  process.env.UPLOAD_DIR || path.join(__dirname, "../uploads");

app.use("/uploads", express.static(uploadDir));
app.use("/uploads/avatars", express.static(path.join(uploadDir, "avatars")));

/* ---------------- ROUTES ---------------- */

app.use("/api/auth", authRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api/issues", commentRoutes);
app.use("/api/issues", attachmentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/attachments", attachmentSigned);
app.use("/api/issues", voteRoutes);

app.use(errorHandler);

/* ---------------- SWAGGER API DOCS ---------------- */

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "CivicFix API",
      version: "1.0.0",
      description: "API documentation for CivicFix Backend"
    },

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      }
    },

    security: [
      {
        bearerAuth: []
      }
    ]
  },

  apis: ["./src/routes/*.js"]
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/* ---------------- HEALTH CHECK ---------------- */

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "CivicFix backend running"
  });
});

/* ---------------- ERROR HANDLER ---------------- */

app.use(errorHandler);

/* ---------------- SERVER ---------------- */

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDatabase();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📄 Swagger Docs: http://localhost:${PORT}/api/docs`);
      console.log(`❤️ Health Check: http://localhost:${PORT}/api/health`);
    });

  } catch (error) {

    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();