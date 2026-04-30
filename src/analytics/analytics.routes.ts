import { Router } from "express";
import { fleetStats, TripPerformanceStats, licenseExpirationAlert, routeProfitabilityStats, upcomingTrips } from "./analytics.controller.js";

const analyticsRouter = Router();

function asyncHandler(fn: Function) {
  return function (req: any, res: any, next: any): void {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

analyticsRouter.get("/fleet-stats", asyncHandler(fleetStats));
analyticsRouter.get("/trip-performance-stats", asyncHandler(TripPerformanceStats));
analyticsRouter.get("/license-expiration-alerts", asyncHandler(licenseExpirationAlert));
analyticsRouter.get("/route-profitability-stats", asyncHandler(routeProfitabilityStats));
analyticsRouter.get("/upcoming-trips", asyncHandler(upcomingTrips));

export { analyticsRouter };