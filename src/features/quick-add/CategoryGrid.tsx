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
}

export function CategoryGrid({
  categories,
  selectedId,
  onSelect,
}: CategoryGridProps) {
  const [addCategoryOpen, setAddCategoryOpen] = useState(false);
  const { settings } = usePersonalization();
  const accentColor = settings.accentColor || '#E8A020';

  return (
    <div className="relative">
      <div className="grid grid-cols-4 gap-1.5">
        <AnimatePresence mode="popLayout">
          {categories.map((category) => {
            const isSelected = category.id === selectedId;
            return (
              <motion.button
                key={category.id}
                layout
                type="button"
                initial={false}
                whileTap={{ scale: 0.96, transition: { duration: 0.1 } }}
                animate={isSelected ? { scale: 1.02 } : { scale: 1 }}
                onClick={() => {
                  if (category.id != null) onSelect(category.id);
                }}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-1 rounded-2xl border transition-all duration-200 text-center min-h-[84px] touch-none px-1 py-2",
                  isSelected
                    ? "border-transparent shadow-sm"
                    : "bg-white/70 border-border/20"
                )}
                style={isSelected ? {
                  backgroundColor: category.color,
                } : {}}
              >
                <span className="text-[26px] leading-none shrink-0 mb-1">
                  {category.icon}
                </span>

                <span className={cn(
                  "text-[10px] font-black leading-tight line-clamp-2",
                  isSelected ? "text-white" : "text-text"
                )}>
                  {category.name}
                </span>
              </motion.button>
            );
          })}

            <motion.button
              layout
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={() => setAddCategoryOpen(true)}
              className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-border/30 min-h-[84px] bg-white/40 touch-none"
            >
              <div
                className="size-6 rounded-full flex items-center justify-center text-white shrink-0"
                style={{ backgroundColor: `${accentColor}20` }}
              >
                <Plus size={14} strokeWidth={3} style={{ color: accentColor }} />
              </div>
              <span className="text-[9px] font-black uppercase tracking-tight text-center px-1" style={{ color: accentColor }}>
                Thêm mới
              </span>
            </motion.button>
        </AnimatePresence>
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
