import { useState } from "react";
import { Plus } from "lucide-react";
import { db } from "@/lib/db";
import { useCategoryStore } from "@/stores/categoryStore";
import { CategoryFormSheet } from "@/features/settings/CategoryFormSheet";
import type { BudgetCategory } from "@/types";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { usePersonalization } from "@/hooks/usePersonalization";

interface CategoryGridProps {
  categories: BudgetCategory[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  showAdd?: boolean;
}

/**
 * Senior UX Architecture: Tactile Category Row
 * Refined the horizontal scroll with premium 'Tactile' pills.
 * Replaces hard gradients with a CSS mask for seamless edge fading.
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
    <div className="relative py-1">
      <div 
        className="flex gap-3 overflow-x-auto pb-5 pt-3 snap-x scrollbar-hide -mx-6 px-6"
        style={{ 
            WebkitOverflowScrolling: 'touch',
        }}
      >
        {categories.map((category) => {
          const isSelected = category.id === selectedId;
          return (
            <motion.button
              key={category.id}
              type="button"
              initial={false}
              animate={isSelected ? { scale: 1.05 } : { scale: 1 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => {
                category.id != null && onSelect(category.id);
              }}
              className={cn(
                "snap-center shrink-0 flex items-center gap-2.5 h-[46px] px-5 rounded-full border-[1.5px] transition-all duration-300",
                isSelected 
                  ? "bg-white shadow-xl shadow-accent/10 z-10" 
                  : "bg-white/80 border-border/30 text-text-muted hover:bg-white"
              )}
              style={{
                borderColor: isSelected ? category.color : 'transparent',
                backgroundColor: isSelected ? `${category.color}10` : undefined,
                color: isSelected ? category.color : undefined
              }}
            >
              <motion.span 
                animate={isSelected ? { rotate: [0, -10, 10, 0] } : {}}
                className="text-[22px] shrink-0"
              >
                {category.icon}
              </motion.span>
              <span className={cn(
                  "text-[14px] font-black whitespace-nowrap tracking-tight",
                  isSelected ? "opacity-100" : "opacity-60"
              )}>
                {category.name}
              </span>
            </motion.button>
          );
        })}

        {showAdd && (
          <motion.button
            type="button"
            whileTap={{ scale: 0.92 }}
            onClick={() => setAddCategoryOpen(true)}
            className="snap-center shrink-0 flex items-center gap-2 h-[46px] px-6 rounded-full border-[2px] border-dashed transition-all relative group/add"
            style={{ 
                borderColor: `${accentColor}40`,
                backgroundColor: 'rgba(255,255,255,0.5)'
            }}
          >
            <div 
                className="size-6 rounded-full flex items-center justify-center text-white shadow-sm"
                style={{ backgroundColor: accentColor }}
            >
                <Plus size={16} strokeWidth={3} />
            </div>
            <span className="text-[14px] font-extrabold uppercase tracking-tight" style={{ color: accentColor }}>
                Thêm
            </span>
          </motion.button>
        )}
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
