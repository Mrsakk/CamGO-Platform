/**
 * home.js – Home aggregated query definition using api client.
 *
 * Uses axios client configured with VITE_API_URL so it properly connects
 * to the deployed backend on Vercel in production or localhost in development.
 */

import api from "../axios";

export const HOME_QUERY_KEY = ["home", "v1"];

/**
 * Fetch handler for the aggregated home payload.
 */
export async function fetchHome() {
  const response = await api.get("/home");
  return response.data?.data || response.data;
}

export const homeQuery = {
  queryKey: HOME_QUERY_KEY,
  queryFn: fetchHome,
};

export default homeQuery;
