import { useState } from "react";
import { Plus } from "lucide-react";
import { db } from "@/lib/db";
import { useCategoryStore } from "@/stores/categoryStore";
import { CategoryFormSheet } from "@/features/settings/CategoryFormSheet";
import type { BudgetCategory } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { usePersonalization } from "@/hooks/usePersonalization";

interface CategoryGridProps {
  categories: BudgetCategory[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  showAdd?: boolean;
}

/**
 * Senior UX Architecture: Compact Tactical Grid
 * Reduced footprint (4 columns) and internal vertical scrolling.
 * Keeps the 'QuickAdd' sheet compact while supporting many categories.
 */
export function CategoryGrid({
  categories,
  selectedId,
  onSelect,
  showAdd,
}: CategoryGridProps) {
  const [addCategoryOpen, setAddCategoryOpen] = useState(false);
  const { settings } = usePersonalization();
  const accentColor = settings.accentColor || '#E8A020';

  return (
    <div className="relative">
      {/* 
        Scrollable Container with Max Height
        Limits the vertical space to ~2.5 rows (180px)
      */}
      <div className="max-h-[150px] overflow-y-auto scrollbar-hide px-0.5 pb-2 pt-1 -mx-0.5">
        <div className="grid grid-cols-4 gap-2">
          <AnimatePresence mode="popLayout">
            {categories.map((category) => {
              const isSelected = category.id === selectedId;
              return (
                <motion.button
                  key={category.id}
                  layout
                  type="button"
                  initial={false}
                  animate={isSelected ? { 
                      scale: 1,
                      backgroundColor: category.color,
                      borderColor: category.color
                  } : { 
                      scale: 1,
                      backgroundColor: 'rgba(255,255,255,0.7)',
                      borderColor: 'transparent'
                  }}
                  whileTap={{ 
                      scale: 0.92, 
                      opacity: 0.8,
                      transition: { type: "spring", stiffness: 400, damping: 10 } 
                  }}
                  onClick={() => {
                    category.id != null && onSelect(category.id);
                  }}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 h-[68px] rounded-xl border-[1.5px] transition-all duration-300 relative overflow-hidden group touch-none",
                    isSelected 
                      ? "shadow-md shadow-black/10 z-10" 
                      : "text-text-muted hover:bg-white border-border/5"
                  )}
                  style={{
                    color: isSelected ? 'white' : undefined
                  }}
                >
                  <motion.span 
                    animate={isSelected ? { scale: [1, 1.2, 1] } : {}}
                    className="text-[22px] leading-none z-10"
                  >
                    {category.icon}
                  </motion.span>
                  <span className={cn(
                      "text-[9px] font-black uppercase tracking-tight z-10 line-clamp-1 px-1 text-center leading-tight",
                      isSelected ? "opacity-100" : "opacity-50"
                  )}>
                    {category.name}
                  </span>
                </motion.button>
              );
            })}

            {showAdd && (
              <motion.button
                layout
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={() => setAddCategoryOpen(true)}
                className="flex flex-col items-center justify-center gap-1 h-[68px] rounded-xl border-[1.5px] border-dashed transition-all bg-white/40"
                style={{ 
                    borderColor: `${accentColor}30`,
                }}
              >
                <div 
                    className="size-5 rounded-full flex items-center justify-center text-white shadow-sm"
                    style={{ backgroundColor: accentColor }}
                >
                    <Plus size={14} strokeWidth={4} />
                </div>
                <span className="text-[9px] font-black uppercase tracking-tight" style={{ color: accentColor }}>
                    Thêm
                </span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      <CategoryFormSheet
        open={addCategoryOpen}
        onClose={() => setAddCategoryOpen(false)}
        onSave={async (data) => {
          const count = await db.categories.count();
          const id = await db.categories.add({
            ...data,
            sortOrder: count,
            color: "#F5C043",
          });
          await useCategoryStore.getState().loadCategories();
          onSelect(id as number);
          setAddCategoryOpen(false);
        }}
      />
    </div>
  );
}
