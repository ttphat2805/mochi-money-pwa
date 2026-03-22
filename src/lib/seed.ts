import { db } from '@/lib/db'
import { DEFAULT_CATEGORIES, CATEGORY_COLORS } from '@/types'

/**
 * Singleton promise guard — prevents React 18 StrictMode's double-invocation
 * from racing two concurrent seeds when count=0 on both reads.
 */
let seedPromise: Promise<void> | null = null

/**
 * Seed the 10 default categories on first app init.
 * Only runs if the categories table is empty — safe to call on every app start.
 * Uses a promise singleton to be idempotent even under StrictMode double-invoke.
 */
export async function seedDefaultCategories(): Promise<void> {
  // Return the in-flight promise if seeding is already happening
  if (seedPromise) return seedPromise

  seedPromise = (async () => {
    const count = await db.categories.count()
    if (count > 0) return

    const categories = DEFAULT_CATEGORIES.map((cat, index) => ({
      name: cat.name,
      icon: cat.icon,
      color: (cat as any).color ?? CATEGORY_COLORS[index % CATEGORY_COLORS.length],
      limitPerMonth: null,
      sortOrder: index,
    }))

    await db.categories.bulkAdd(categories)
  })()

  return seedPromise
}
