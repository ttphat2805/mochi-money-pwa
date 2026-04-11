import { useState } from "react";
import { Plus } from "lucide-react";
import { db } from "@/lib/db";
import { useCategoryStore } from "@/stores/categoryStore";
import { CategoryFormSheet } from "@/features/settings/CategoryFormSheet";
import type { BudgetCategory } from "@/types";
import { motion } from "framer-motion";

interface CategoryGridProps {
  categories: BudgetCategory[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  showAdd?: boolean;
  scrollable?: boolean;
  className?: string;
}

export function CategoryGrid({
  categories,
  selectedId,
  onSelect,
  showAdd,
  scrollable = true,
  className,
}: CategoryGridProps) {
  const [addCategoryOpen, setAddCategoryOpen] = useState(false);

  if (categories.length === 0) {
    return (
      <div className="text-text-muted py-4 text-center text-[13px] font-medium">
        Chưa có danh mục nào
      </div>
    );
  }

  return (
    <div
      className={className}
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 8,
        ...(scrollable ? {
          maxHeight: 180,
          overflowY: 'auto',
          scrollbarWidth: 'none',
        } : {
          maxHeight: 'none',
          overflow: 'visible',
        }),
      }}
    >
        {categories.map((category) => {
          const isSelected = category.id === selectedId;
          return (
            <motion.button
              key={category.id}
              type="button"
              whileTap={{ scale: 0.96 }}
              animate={isSelected ? { scale: [1, 1.03, 1] } : {}}
              transition={{ duration: 0.2 }}
              onClick={() => category.id != null && onSelect(category.id)}
              className={`group flex h-12 items-center gap-3 rounded-2xl border px-3 text-left transition-all ${
                isSelected
                  ? "border-accent bg-accent-bg shadow-sm"
                  : "border-border/60 bg-white active:bg-surface"
              }`}
            >
              <span className="text-2xl leading-none shrink-0 transition-transform group-active:scale-90">
                {category.icon}
              </span>
              <span
                className={`truncate text-[13px] font-bold ${
                  isSelected ? "text-accent-dark" : "text-text"
                }`}
              >
                {category.name}
              </span>
            </motion.button>
          );
        })}

        {showAdd && (
          <motion.button
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={() => setAddCategoryOpen(true)}
            className="flex h-12 items-center justify-center gap-2 rounded-2xl border-[1.5px] border-dashed border-border bg-transparent text-text-hint text-[12px] font-bold transition-colors hover:border-accent hover:text-accent"
          >
            <Plus size={14} />
            Thêm
          </motion.button>
        )}

      {/* Add new category sheet */}
      <CategoryFormSheet
        open={addCategoryOpen}
        onClose={() => setAddCategoryOpen(false)}
        onSave={async (data) => {
          const count = await db.categories.count();
          const id = await db.categories.add({
            ...data,
            sortOrder: count,
            color: "#F5C043", // default color since it is required
          });
          await useCategoryStore.getState().loadCategories();
          onSelect(id as number);
          setAddCategoryOpen(false);
        }}
      />
    </div>
  );
}
