import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

@Injectable()
export class MultiTenantMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Skip middleware for public routes
    const publicRoutes = ["/api", "/health", "/auth"];
    if (publicRoutes.some((route) => req.path.startsWith(route))) {
      return next();
    }

    // If user is authenticated (from JWT), extract companyId from user object
    // Otherwise, fall back to X-Company-Id header for backward compatibility
    const user = (req as any).user;
    if (user && user.companyId) {
      (req as any).companyId = user.companyId;
    } else {
      // Fallback to header for testing/development
      const companyId = req.headers["x-company-id"] as string;
      if (companyId) {
        (req as any).companyId = companyId;
      }
    }

    next();
  }
}

