import type {
  EvacuationRoute,
  HazardZone,
  Point2D,
  RouteScoringConfig,
} from "../types/evora.ts";

export const DEFAULT_SCORING_CONFIG: RouteScoringConfig = {
  distanceWeight: 0.25,
  exposureWeight: 0.50,
  densityWeight: 0.15,
  accessibilityWeight: 0.10,
  riskThreshold: 65,
};

function pointToSegmentDistance(p: Point2D, v: Point2D, w: Point2D): number {
  const l2 = (w.x - v.x) ** 2 + (w.y - v.y) ** 2;
  if (l2 === 0) return Math.hypot(p.x - v.x, p.y - v.y);
  let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  const projX = v.x + t * (w.x - v.x);
  const projY = v.y + t * (w.y - v.y);
  return Math.hypot(p.x - projX, p.y - projY);
}

export function computeRouteHazardExposure(
  waypoints: Point2D[],
  hazards: HazardZone[]
): { exposureScore: number; intersectingHazards: string[] } {
  const activeHazards = hazards.filter((h) => h.active && h.radius > 0);
  if (activeHazards.length === 0 || waypoints.length < 2) {
    return { exposureScore: 8, intersectingHazards: [] };
  }

  let totalExposure = 0;
  const intersecting: string[] = [];

  for (const hazard of activeHazards) {
    let minDistance = Infinity;
    for (let i = 0; i < waypoints.length - 1; i++) {
      const d = pointToSegmentDistance(
        { x: hazard.x, y: hazard.y },
        waypoints[i],
        waypoints[i + 1]
      );
      if (d < minDistance) minDistance = d;
    }

    const severityMultiplier =
      hazard.severity === "critical"
        ? 1.0
        : hazard.severity === "high"
        ? 0.78
        : hazard.severity === "moderate"
        ? 0.55
        : 0.3;

    if (minDistance <= hazard.radius) {
      const penetrationRatio = 1 - minDistance / Math.max(hazard.radius, 1);
      const impact = Math.round((72 + penetrationRatio * 28) * severityMultiplier);
      totalExposure += impact;
      intersecting.push(hazard.name);
    } else if (minDistance <= hazard.radius * 1.35) {
      const proximityRatio =
        1 - (minDistance - hazard.radius) / (hazard.radius * 0.35);
      const impact = Math.round(proximityRatio * 22 * severityMultiplier);
      totalExposure += impact;
    }
  }

  const clampedExposure = Math.max(8, Math.min(98, totalExposure));
  return {
    exposureScore: clampedExposure,
    intersectingHazards: intersecting,
  };
}

// Illustrative prototype scoring model (not a certified safety engineering algorithm)
export function evaluateFacilityRoutes(
  baseRoutes: EvacuationRoute[],
  hazards: HazardZone[],
  config: RouteScoringConfig
): EvacuationRoute[] {
  const maxDistance = 420;

  const scored = baseRoutes.map((route) => {
    const facilityHazards = hazards.filter(
      (h) => h.facilityId === route.facilityId
    );
    const { exposureScore, intersectingHazards } = computeRouteHazardExposure(
      route.waypoints,
      facilityHazards
    );

    const normalizedDistance = Math.min(
      100,
      Math.round((route.distanceMeters / maxDistance) * 100)
    );
    const normalizedExposure = exposureScore;
    const normalizedDensity = route.densityScore;
    const accessibilityPenaltyRaw = route.accessible ? 0 : 100;

    const weightSum =
      config.distanceWeight +
      config.exposureWeight +
      config.densityWeight +
      config.accessibilityWeight || 1;

    const dW = config.distanceWeight / weightSum;
    const eW = config.exposureWeight / weightSum;
    const denW = config.densityWeight / weightSum;
    const aW = config.accessibilityWeight / weightSum;

    const distanceContribution = Math.round(dW * normalizedDistance);
    const criticalDirectHitBonus =
      intersectingHazards.length > 0 ? 12 : 0;
    const exposureContribution =
      Math.round(eW * normalizedExposure) + criticalDirectHitBonus;
    const densityContribution = Math.round(denW * normalizedDensity);
    const accessibilityPenalty = Math.round(aW * accessibilityPenaltyRaw);

    const compositeScore = Math.min(
      100,
      distanceContribution +
        exposureContribution +
        densityContribution +
        accessibilityPenalty
    );

    return {
      ...route,
      hazardExposure: normalizedExposure,
      riskScore: compositeScore,
      intersectingHazards,
      scoreBreakdown: {
        distanceContribution,
        exposureContribution,
        densityContribution,
        accessibilityPenalty,
      },
    };
  });

  // Group by facilityId so each facility gets its own ranking
  const byFacility = new Map<string, typeof scored>();
  for (const r of scored) {
    const list = byFacility.get(r.facilityId) ?? [];
    list.push(r);
    byFacility.set(r.facilityId, list);
  }

  const finalRoutes: EvacuationRoute[] = [];

  for (const [, routesInFacility] of byFacility.entries()) {
    const eligible = routesInFacility
      .filter((r) => r.accessible && r.riskScore <= config.riskThreshold)
      .sort((a, b) => a.riskScore - b.riskScore);

    const recommendedId = eligible.length > 0 ? eligible[0].id : null;

    for (const r of routesInFacility) {
      let status: EvacuationRoute["status"] = "alternative";
      let explanation = "";

      if (!r.accessible) {
        status = "blocked";
        explanation = `Route blocked: corridor fails accessibility check (${r.accessibilityNote}). Excluded from recommendation.`;
      } else if (r.riskScore > config.riskThreshold) {
        status = "blocked";
        const hazardText =
          r.intersectingHazards.length > 0
            ? `intersects ${r.intersectingHazards.join(" and ")}`
            : `elevated multi-hazard exposure (${r.hazardExposure}/100)`;
        explanation = `Route blocked: risk score (${r.riskScore}/100) exceeds configured threshold (${config.riskThreshold}/100) because corridor ${hazardText}.`;
      } else if (r.id === recommendedId) {
        status = "recommended";
        explanation = `Recommended based on current simulated conditions: lowest composite risk score (${r.riskScore}/100, threshold ${config.riskThreshold}) with ${r.distanceMeters} m travel distance, ${r.hazardExposure}/100 hazard exposure, and verified accessibility.`;
      } else {
        status = "alternative";
        explanation = `Eligible alternative route (risk score ${r.riskScore}/100 <= threshold ${config.riskThreshold}). Higher composite cost than the recommended corridor due to distance (${r.distanceMeters} m) or crowd density (${r.densityScore}/100).`;
      }

      const { intersectingHazards: _unused, ...cleanRoute } = r;
      finalRoutes.push({
        ...cleanRoute,
        status,
        explanation,
      });
    }
  }

  return finalRoutes;
}
