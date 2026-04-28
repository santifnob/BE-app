import { Router } from "express";
import { fleetStats, TripPerformanceStats } from "./analytics.controller.js";

const analyticsRouter = Router();

function asyncHandler(fn: Function) {
  return function (req: any, res: any, next: any): void {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

analyticsRouter.get("/fleet-stats", asyncHandler(fleetStats));
analyticsRouter.get("/trip-performance-stats", asyncHandler(TripPerformanceStats));

export { analyticsRouter };