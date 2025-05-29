import express from "express";
import {
  getReviewsByProduct,
  createReview,
  updateReview,
  deleteReview,
} from "../controllers/reviewController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/products/:productId", getReviewsByProduct);
router.post("/", authenticateToken, createReview);
router.patch("/:id", authenticateToken, updateReview);
router.delete("/:id", authenticateToken, deleteReview);

export default router;