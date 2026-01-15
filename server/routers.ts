import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  getServiceProviderById,
  getApprovedProviders,
  getPendingProviders,
  getProvidersByUserId,
  getAllCategories,
  getCategoryById,
  getAllNeighborhoods,
  getNeighborhoodById,
  getUserProfile,
  createOrUpdateUserProfile,
  approveProvider,
  rejectProvider,
  toggleProviderStatus,
  toggleProviderFeatured,
  getDb,
} from "./db";
import { serviceProviders, serviceCategories, neighborhoods } from "../drizzle/schema";
import { notifyOwner } from "./_core/notification";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";

// Helper to check if user is admin
const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const profile = await getUserProfile(ctx.user.id);
  if (!profile || profile.userType !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

// Helper to check if user is provider
const providerProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const profile = await getUserProfile(ctx.user.id);
  if (!profile || (profile.userType !== "provider" && profile.userType !== "admin")) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Provider access required" });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
    
    // Get or create user profile
    getProfile: protectedProcedure.query(async ({ ctx }) => {
      let profile = await getUserProfile(ctx.user.id);
      if (!profile) {
        await createOrUpdateUserProfile(ctx.user.id, "customer");
        profile = await getUserProfile(ctx.user.id);
      }
      return profile;
    }),
    
    // Update user profile type
    updateProfileType: protectedProcedure
      .input(z.enum(["customer", "provider", "admin"]))
      .mutation(async ({ ctx, input }) => {
        await createOrUpdateUserProfile(ctx.user.id, input);
        return await getUserProfile(ctx.user.id);
      }),
  }),

  // Public procedures for browsing providers
  providers: router({
    // Get all approved providers with optional filters
    list: publicProcedure
      .input(
        z.object({
          categoryId: z.number().optional(),
          neighborhoodId: z.number().optional(),
        }).optional()
      )
      .query(async ({ input }) => {
        const providers = await getApprovedProviders({
          categoryId: input?.categoryId,
          neighborhoodId: input?.neighborhoodId,
        });
        return providers;
      }),

    // Get single provider details
    getById: publicProcedure
      .input(z.number())
      .query(async ({ input }) => {
        const provider = await getServiceProviderById(input);
        if (!provider) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        return provider;
      }),

    // Get featured providers
    featured: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return db
        .select()
        .from(serviceProviders)
        .where(and(eq(serviceProviders.status, "approved"), eq(serviceProviders.isFeatured, 1)));
    }),
  }),

  // Provider procedures
  myProvider: router({
    // Get current user's provider profile
    get: protectedProcedure.query(async ({ ctx }) => {
      const providers = await getProvidersByUserId(ctx.user.id);
      return providers.length > 0 ? providers[0] : null;
    }),

    // Create new provider profile
    create: providerProcedure
      .input(
        z.object({
          name: z.string().min(3).max(150),
          phone: z.string().min(10).max(20),
          categoryId: z.number(),
          neighborhoodId: z.number(),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        // Check if provider already exists
        const existing = await getProvidersByUserId(ctx.user.id);
        if (existing.length > 0) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Provider profile already exists" });
        }

        // Validate category and neighborhood exist
        const category = await getCategoryById(input.categoryId);
        const neighborhood = await getNeighborhoodById(input.neighborhoodId);
        
        if (!category || !neighborhood) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid category or neighborhood" });
        }

        // Insert provider
        await db.insert(serviceProviders).values({
          userId: ctx.user.id,
          name: input.name,
          phone: input.phone,
          categoryId: input.categoryId,
          neighborhoodId: input.neighborhoodId,
          description: input.description,
          status: "pending",
          isActive: 1,
        });

        // Notify admin about new provider
        await notifyOwner({
          title: "Novo Prestador Aguardando Aprovação",
          content: `${input.name} se cadastrou como ${category.name}. Acesse o painel de admin para revisar.`,
        });

        return await getProvidersByUserId(ctx.user.id);
      }),

    // Update provider profile
    update: providerProcedure
      .input(
        z.object({
          name: z.string().min(3).max(150).optional(),
          phone: z.string().min(10).max(20).optional(),
          description: z.string().optional(),
          categoryId: z.number().optional(),
          neighborhoodId: z.number().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const provider = await getProvidersByUserId(ctx.user.id);
        if (!provider || provider.length === 0) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        const updates: any = {};
        if (input.name) updates.name = input.name;
        if (input.phone) updates.phone = input.phone;
        if (input.description !== undefined) updates.description = input.description;
        if (input.categoryId) updates.categoryId = input.categoryId;
        if (input.neighborhoodId) updates.neighborhoodId = input.neighborhoodId;

        await db
          .update(serviceProviders)
          .set(updates)
          .where(eq(serviceProviders.id, provider[0].id));

        return await getProvidersByUserId(ctx.user.id);
      }),

    // Toggle provider active/inactive status
    toggleStatus: providerProcedure.mutation(async ({ ctx }) => {
      const provider = await getProvidersByUserId(ctx.user.id);
      if (!provider || provider.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      await toggleProviderStatus(provider[0].id);
      return await getProvidersByUserId(ctx.user.id);
    }),
  }),

  // Admin procedures
  admin: router({
    // Get pending provider approvals
    pendingApprovals: adminProcedure.query(async () => {
      return await getPendingProviders();
    }),

    // Approve provider
    approveProvider: adminProcedure
      .input(z.number())
      .mutation(async ({ input: providerId }) => {
        await approveProvider(providerId);
        return await getServiceProviderById(providerId);
      }),

    // Reject provider
    rejectProvider: adminProcedure
      .input(
        z.object({
          providerId: z.number(),
          reason: z.string(),
        })
      )
      .mutation(async ({ input: { providerId, reason } }) => {
        await rejectProvider(providerId, reason);
        return await getServiceProviderById(providerId);
      }),

    // Toggle featured status
    toggleFeatured: adminProcedure
      .input(z.number())
      .mutation(async ({ input: providerId }) => {
        await toggleProviderFeatured(providerId);
        return await getServiceProviderById(providerId);
      }),

    // Manage categories
    categories: router({
      list: adminProcedure.query(async () => {
        return await getAllCategories();
      }),

      create: adminProcedure
        .input(
          z.object({
            name: z.string().min(3).max(100),
            description: z.string().optional(),
            icon: z.string().optional(),
            synonyms: z.array(z.string()).optional(),
          })
        )
        .mutation(async ({ input }) => {
          const db = await getDb();
          if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

          await db.insert(serviceCategories).values({
            name: input.name,
            description: input.description,
            icon: input.icon,
            synonyms: input.synonyms ? JSON.stringify(input.synonyms) : null,
          });

          return { success: true };
        }),

      update: adminProcedure
        .input(
          z.object({
            id: z.number(),
            name: z.string().optional(),
            description: z.string().optional(),
            icon: z.string().optional(),
            synonyms: z.array(z.string()).optional(),
          })
        )
        .mutation(async ({ input }) => {
          const db = await getDb();
          if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

          const updates: any = {};
          if (input.name) updates.name = input.name;
          if (input.description !== undefined) updates.description = input.description;
          if (input.icon !== undefined) updates.icon = input.icon;
          if (input.synonyms !== undefined) updates.synonyms = JSON.stringify(input.synonyms);

          await db
            .update(serviceCategories)
            .set(updates)
            .where(eq(serviceCategories.id, input.id));

          return await getCategoryById(input.id);
        }),

      delete: adminProcedure
        .input(z.number())
        .mutation(async ({ input: categoryId }) => {
          const db = await getDb();
          if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

          await db
            .delete(serviceCategories)
            .where(eq(serviceCategories.id, categoryId));

          return { success: true };
        }),
    }),

    // Manage neighborhoods
    neighborhoods: router({
      list: adminProcedure.query(async () => {
        return await getAllNeighborhoods();
      }),

      create: adminProcedure
        .input(z.string().min(3).max(100))
        .mutation(async ({ input: name }) => {
          const db = await getDb();
          if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

          await db.insert(neighborhoods).values({
            name,
          });

          return { success: true };
        }),

      delete: adminProcedure
        .input(z.number())
        .mutation(async ({ input: neighborhoodId }) => {
          const db = await getDb();
          if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

          await db
            .delete(neighborhoods)
            .where(eq(neighborhoods.id, neighborhoodId));

          return { success: true };
        }),
    }),
  }),

  // Public data endpoints
  data: router({
    categories: publicProcedure.query(async () => {
      return await getAllCategories();
    }),

    neighborhoods: publicProcedure.query(async () => {
      return await getAllNeighborhoods();
    }),
  }),
});

export type AppRouter = typeof appRouter;
