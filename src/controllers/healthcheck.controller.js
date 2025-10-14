import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const healthCheck = asyncHandler(async (req, res) => {
  res.status(200).json(new ApiResponse(200, null, "Server is running"));
});

export { healthCheck };
