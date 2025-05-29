import { createContext, useContext, useState, useCallback } from "react";
import {
  getReviewsByProduct,
  createReview,
  updateReview,
  deleteReview,
} from "../api/review";
import toast from "react-hot-toast";

const ReviewContext = createContext();

export const ReviewProvider = ({ children }) => {
    const [reviews, setReviews] = useState([]);
    const [averageRating, setAverageRating] = useState(0);

    // ✅ 제품별 리뷰 불러오기
    const fetchReviews = useCallback(async (productId) => {
        try {
        const res = await getReviewsByProduct(productId);
        setReviews(res.data.reviews);
        setAverageRating(res.data.averageRating);
        } catch (err) {
        toast.error("리뷰를 불러오는 데 실패했어요.");
        }
    }, []);

    // ✅ 리뷰 작성
    const addReview = useCallback(async (reviewData) => {
    try {
        const res = await createReview(reviewData);
        toast.success("리뷰가 등록되었어요.");
        return res.data;
    } catch (err) {
        toast.error(err?.response?.data?.error || "리뷰 등록 실패");
        throw err;
    }
    }, []);

    // ✅ 리뷰 수정
    const editReview = useCallback(async (id, reviewData) => {
    try {
        const res = await updateReview(id, reviewData);
        toast.success("리뷰가 수정되었어요.");
        return res.data;
    } catch (err) {
        toast.error("리뷰 수정 실패");
        throw err;
    }
    }, []);

    // ✅ 리뷰 삭제
    const removeReview = useCallback(async (id) => {
    try {
        await deleteReview(id);
        toast.success("리뷰가 삭제되었어요.");
    } catch (err) {
        toast.error("리뷰 삭제 실패");
        throw err;
    }
    }, []);

    return (
        <ReviewContext.Provider
        value={{
            reviews,
            averageRating,
            fetchReviews,
            addReview,
            editReview,
            removeReview,
        }}
        >
        {children}
        </ReviewContext.Provider>
    );
};

export const useReview = () => useContext(ReviewContext);