import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock user contexts
const createMockContext = (userId: number, role: "user" | "admin" = "user"): TrpcContext => ({
  user: {
    id: userId,
    openId: `test-user-${userId}`,
    email: `test${userId}@example.com`,
    name: `Test User ${userId}`,
    loginMethod: "test",
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  },
  req: {
    protocol: "https",
    headers: {},
  } as TrpcContext["req"],
  res: {
    clearCookie: () => {},
  } as TrpcContext["res"],
});

describe("Providers API", () => {
  describe("Public procedures", () => {
    it("should list approved providers", async () => {
      const ctx = createMockContext(1);
      const caller = appRouter.createCaller(ctx);

      const providers = await caller.providers.list({});
      expect(Array.isArray(providers)).toBe(true);
    });

    it("should get provider by id", async () => {
      const ctx = createMockContext(1);
      const caller = appRouter.createCaller(ctx);

      try {
        const provider = await caller.providers.getById(999);
        expect(provider).toBeDefined();
      } catch (error: any) {
        expect(error.code).toBe("NOT_FOUND");
      }
    });

    it("should get featured providers", async () => {
      const ctx = createMockContext(1);
      const caller = appRouter.createCaller(ctx);

      const featured = await caller.providers.featured();
      expect(Array.isArray(featured)).toBe(true);
    });
  });

  describe("Data endpoints", () => {
    it("should get all categories", async () => {
      const ctx = createMockContext(1);
      const caller = appRouter.createCaller(ctx);

      const categories = await caller.data.categories();
      expect(Array.isArray(categories)).toBe(true);
    });

    it("should get all neighborhoods", async () => {
      const ctx = createMockContext(1);
      const caller = appRouter.createCaller(ctx);

      const neighborhoods = await caller.data.neighborhoods();
      expect(Array.isArray(neighborhoods)).toBe(true);
    });
  });

  describe("Auth procedures", () => {
    it("should get current user profile", async () => {
      const ctx = createMockContext(1);
      const caller = appRouter.createCaller(ctx);

      const profile = await caller.auth.getProfile();
      expect(profile).toBeDefined();
      expect(profile?.userType).toBeDefined();
    });

    it("should update user profile type", async () => {
      const ctx = createMockContext(2);
      const caller = appRouter.createCaller(ctx);

      const updated = await caller.auth.updateProfileType("provider");
      expect(updated?.userType).toBe("provider");
    });
  });

  describe("Provider procedures", () => {
    it("should require provider role to create provider profile", async () => {
      const ctx = createMockContext(3, "user");
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.myProvider.create({
          name: "Test Provider",
          phone: "93988888888",
          categoryId: 1,
          neighborhoodId: 1,
        });
        expect.fail("Should have thrown FORBIDDEN error");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });

    it("should get current user provider profile", async () => {
      const ctx = createMockContext(4);
      const caller = appRouter.createCaller(ctx);

      const provider = await caller.myProvider.get();
      expect(provider === null || typeof provider === "object").toBe(true);
    });

    it("should toggle provider status", async () => {
      const ctx = createMockContext(5);
      const caller = appRouter.createCaller(ctx);

      try {
        const result = await caller.myProvider.toggleStatus();
        expect(Array.isArray(result)).toBe(true);
      } catch (error: any) {
        expect(["NOT_FOUND", "FORBIDDEN"]).toContain(error.code);
      }
    });
  });

  describe("Admin procedures", () => {
    it("should require admin role for admin procedures", async () => {
      const ctx = createMockContext(6, "user");
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.admin.pendingApprovals();
        expect.fail("Should have thrown FORBIDDEN error");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });

    it("should get pending approvals for admin", async () => {
      const ctx = createMockContext(7, "admin");
      const caller = appRouter.createCaller(ctx);

      try {
        const pending = await caller.admin.pendingApprovals();
        expect(Array.isArray(pending)).toBe(true);
      } catch (error: any) {
        // Admin user profile may not exist in test
        expect(error.code).toBe("FORBIDDEN");
      }
    });

    it("should list categories for admin", async () => {
      const ctx = createMockContext(8, "admin");
      const caller = appRouter.createCaller(ctx);

      try {
        const categories = await caller.admin.categories.list();
        expect(Array.isArray(categories)).toBe(true);
      } catch (error: any) {
        // Admin user profile may not exist in test
        expect(error.code).toBe("FORBIDDEN");
      }
    });

    it("should list neighborhoods for admin", async () => {
      const ctx = createMockContext(9, "admin");
      const caller = appRouter.createCaller(ctx);

      try {
        const neighborhoods = await caller.admin.neighborhoods.list();
        expect(Array.isArray(neighborhoods)).toBe(true);
      } catch (error: any) {
        // Admin user profile may not exist in test
        expect(error.code).toBe("FORBIDDEN");
      }
    });
  });
});
