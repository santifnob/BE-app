import { Router } from "express";
import { fleetStats, TripPerformanceStats, licenseExpirationAlert, routeProfitabilityStats, upcomingTrips, earningsConductor, kilometersConductor, lastLicenseConductor, nextTripConductor, tripChartConductor } from "./analytics.controller.js";

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
analyticsRouter.get("/earnings-conductor", asyncHandler(earningsConductor));
analyticsRouter.get("/kilometers-conductor", asyncHandler(kilometersConductor));
analyticsRouter.get("/last-license-conductor", asyncHandler(lastLicenseConductor));
analyticsRouter.get("/next-trip-conductor", asyncHandler(nextTripConductor));
analyticsRouter.get("/trip-chart-conductor", asyncHandler(tripChartConductor));

export { analyticsRouter };