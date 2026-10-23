import api from "../axios";
const reviewApi = {
  getByDestination: async (destinationId, page = 1) => {
    const response = await api.get(`/destinations/${destinationId}/reviews?page=${page}`);
    return response.data;
  },
  submit: async (destinationId, payload) => {
    const response = await api.post(`/destinations/${destinationId}/reviews`, payload);
    return response.data;
  },
  createReview: async (payload) => {
    return reviewApi.submit(payload.destination_id, { rating: payload.rating, comment: payload.comment });
  },
  update: async (reviewId, payload) => {
    const response = await api.put(`/reviews/${reviewId}`, payload);
    return response.data;
  },
  updateReview: async (reviewId, payload) => {
    return reviewApi.update(reviewId, payload);
  },
  delete: async (reviewId) => {
    const response = await api.delete(`/reviews/${reviewId}`);
    return response.data;
  },
  deleteReview: async (reviewId) => {
    return reviewApi.delete(reviewId);
  },
  getMyReviews: async () => {
    const response = await api.get("/profile/reviews");
    return response.data;
  }
};
const reviewsApi = reviewApi;
var stdin_default = reviewApi;
export {
  stdin_default as default,
  reviewApi,
  reviewsApi
};
