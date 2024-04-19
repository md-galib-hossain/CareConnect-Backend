import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { ReviewService } from "./review.service";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import { TAuthUser } from "../../interface/interface";
import pick from "../../utils/pick";
import { reviewFilterableFields } from "./review.constant";

const createReview = catchAsync(async (req: Request & {user? : TAuthUser}, res: Response) => {
    const user = req.user
    const result = await ReviewService.createReviewIntoDB(req.body,user as TAuthUser);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Review created successfully!",
        data: result
    });
});

const getAllReviewsFromDB = catchAsync(async (req: Request, res: Response) => {
    const filters = pick(req.query, reviewFilterableFields);
    const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
    const result = await ReviewService.getAllReviewsFromDB(filters, options);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Reviews retrieval successfully',
        meta: result.meta,
        data: result.data,
    });
});


export const ReviewController = {createReview,getAllReviewsFromDB}