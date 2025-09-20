import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";

// const healthcheckController = (req, res) => {
//     return res.status(200).json(new ApiResponse(200, "Server is running"));
// }

const healthcheckController = asyncHandler(async (req, res) => {
    return res.status(200).json(new ApiResponse(200, { "message": "Server is running" }));
})


export { healthcheckController }