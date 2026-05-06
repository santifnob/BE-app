import { Router } from "express";
import { fleetStats, TripPerformanceStats, licenseExpirationAlert, routeProfitabilityStats, upcomingTrips, earningsConductor, kilometersConductor, lastLicenseConductor, nextTripConductor, tripChartConductor, cargoDistribution, cancellationRiskStats } from "./analytics.controller.js";
import { authorizeRole } from "../middlewares/authMiddlewares.js";
import { allowReadRestrictWrite } from "../middlewares/authMiddlewares.js";

const analyticsRouter = Router();

function asyncHandler(fn: Function) {
  return function (req: any, res: any, next: any): void {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

analyticsRouter.get("/fleet-stats", authorizeRole(),asyncHandler(fleetStats));
analyticsRouter.get("/trip-performance-stats",  authorizeRole(),asyncHandler(TripPerformanceStats));
analyticsRouter.get("/license-expiration-alerts", authorizeRole(), asyncHandler(licenseExpirationAlert));
analyticsRouter.get("/route-profitability-stats", authorizeRole(), asyncHandler(routeProfitabilityStats));
analyticsRouter.get("/upcoming-trips", authorizeRole(), asyncHandler(upcomingTrips));
analyticsRouter.get("/earnings-conductor", allowReadRestrictWrite(),asyncHandler(earningsConductor));
analyticsRouter.get("/kilometers-conductor", allowReadRestrictWrite(), asyncHandler(kilometersConductor));
analyticsRouter.get("/last-license-conductor", allowReadRestrictWrite(), asyncHandler(lastLicenseConductor));
analyticsRouter.get("/next-trip-conductor", allowReadRestrictWrite(), asyncHandler(nextTripConductor));
analyticsRouter.get("/trip-chart-conductor", allowReadRestrictWrite(), asyncHandler(tripChartConductor));
analyticsRouter.get("/cargo-distribution",  authorizeRole(),asyncHandler(cargoDistribution));
analyticsRouter.get("/cancellation-risk-stats",  authorizeRole(),asyncHandler(cancellationRiskStats));

export { analyticsRouter };