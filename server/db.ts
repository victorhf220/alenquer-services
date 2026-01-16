import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  serviceProviders,
  serviceCategories,
  neighborhoods,
  userProfiles,
  reviews,
  contactLogs,
  type ServiceProvider,
  type ServiceCategory,
  type Neighborhood,
  type UserProfile,
  type Review,
  type ContactLog,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Service Providers Queries
 */
export async function getServiceProviderById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(serviceProviders)
    .where(eq(serviceProviders.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getApprovedProviders(filters?: { categoryId?: number; neighborhoodId?: number }) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [eq(serviceProviders.status, "approved")];
  
  if (filters?.categoryId) {
    conditions.push(eq(serviceProviders.categoryId, filters.categoryId));
  }
  if (filters?.neighborhoodId) {
    conditions.push(eq(serviceProviders.neighborhoodId, filters.neighborhoodId));
  }
  
  return db
    .select()
    .from(serviceProviders)
    .where(and(...conditions));
}

export async function getPendingProviders() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(serviceProviders)
    .where(eq(serviceProviders.status, "pending"));
}

export async function approveProvider(id: number) {
  const db = await getDb();
  if (!db) return;
  return db
    .update(serviceProviders)
    .set({ status: "approved", approvedAt: new Date() })
    .where(eq(serviceProviders.id, id));
}

export async function rejectProvider(id: number, reason: string) {
  const db = await getDb();
  if (!db) return;
  return db
    .update(serviceProviders)
    .set({ status: "rejected", rejectionReason: reason })
    .where(eq(serviceProviders.id, id));
}

export async function toggleProviderStatus(id: number) {
  const db = await getDb();
  if (!db) return;
  const provider = await getServiceProviderById(id);
  if (!provider) return;
  return db
    .update(serviceProviders)
    .set({ isActive: provider.isActive ? 0 : 1 })
    .where(eq(serviceProviders.id, id));
}

export async function toggleProviderFeatured(id: number) {
  const db = await getDb();
  if (!db) return;
  const provider = await getServiceProviderById(id);
  if (!provider) return;
  return db
    .update(serviceProviders)
    .set({ isFeatured: provider.isFeatured ? 0 : 1 })
    .where(eq(serviceProviders.id, id));
}

export async function getProvidersByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(serviceProviders)
    .where(eq(serviceProviders.userId, userId));
}

/**
 * Service Categories Queries
 */
export async function getAllCategories() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(serviceCategories);
}

export async function getCategoryById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(serviceCategories)
    .where(eq(serviceCategories.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * Neighborhoods Queries
 */
export async function getAllNeighborhoods() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(neighborhoods);
}

export async function getNeighborhoodById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(neighborhoods)
    .where(eq(neighborhoods.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * User Profiles Queries
 */
export async function getUserProfile(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createOrUpdateUserProfile(
  userId: number,
  userType: "customer" | "provider" | "admin"
) {
  const db = await getDb();
  if (!db) return;
  
  const existing = await getUserProfile(userId);
  if (existing) {
    await db
      .update(userProfiles)
      .set({ userType })
      .where(eq(userProfiles.userId, userId));
  } else {
    await db.insert(userProfiles).values({ userId, userType });
  }
}


/**
 * Reviews Queries
 */
export async function getProviderReviews(providerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(reviews)
    .where(eq(reviews.providerId, providerId));
}

export async function getProviderAverageRating(providerId: number) {
  const db = await getDb();
  if (!db) return 0;
  const providerReviews = await getProviderReviews(providerId);
  
  if (providerReviews.length === 0) return 0;
  const sum = providerReviews.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / providerReviews.length) * 10) / 10;
}

export async function createReview(
  providerId: number,
  userId: number,
  rating: number,
  comment?: string
) {
  const db = await getDb();
  if (!db) return;
  return db.insert(reviews).values({
    providerId,
    userId,
    rating,
    comment,
  });
}

/**
 * Contact Logs Queries
 */
export async function logContact(
  providerId: number,
  userId?: number,
  contactMethod: string = "whatsapp"
) {
  const db = await getDb();
  if (!db) return;
  return db.insert(contactLogs).values({
    providerId,
    userId,
    contactMethod,
  });
}

export async function getProviderContacts(providerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(contactLogs)
    .where(eq(contactLogs.providerId, providerId));
}

export async function getProviderContactCount(providerId: number) {
  const contacts = await getProviderContacts(providerId);
  return contacts.length;
}
