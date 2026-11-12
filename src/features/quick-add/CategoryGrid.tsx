import { useState } from "react";
import { Plus } from "lucide-react";
import { db } from "@/lib/db";
import { useCategoryStore } from "@/stores/categoryStore";
import { CategoryFormSheet } from "@/features/settings/CategoryFormSheet";
import { CategoryIcon } from "@/components/CategoryIcon";
import { CATEGORY_COLORS, type BudgetCategory } from "@/types";
import { cn, tint } from "@/lib/utils";
import { usePersonalization } from "@/hooks/usePersonalization";

interface CategoryGridProps {
  categories: BudgetCategory[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  /** Shorter tiles — fits more rows in Quick Add */
  compact?: boolean;
}

// `touch-manipulation` (not `touch-none`) so a drag that starts on a tile
// still scrolls the grid; plain CSS press feedback instead of per-tile
// framer-motion layout animations (which re-measured every tile per tap).
const TILE_BASE =
  "relative flex flex-col items-center justify-center gap-1 rounded-2xl border text-center px-1 py-2 touch-manipulation select-none transition-[transform,background-color,border-color] duration-150 active:scale-95";

export function CategoryGrid({
  categories,
  selectedId,
  onSelect,
  compact,
}: CategoryGridProps) {
  const [addCategoryOpen, setAddCategoryOpen] = useState(false);
  const { settings } = usePersonalization();
  const accentColor = settings.accentColor;
  const tileHeight = compact ? "min-h-[68px]" : "min-h-[84px]";

  return (
    <div className="relative">
      <div className="grid grid-cols-4 gap-1.5">
        {categories.map((category) => {
          const isSelected = category.id === selectedId;
          return (
            <button
              key={category.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => {
                if (category.id != null) onSelect(category.id);
              }}
              className={cn(
                TILE_BASE,
                tileHeight,
                isSelected
                  ? "border-transparent shadow-sm"
                  : "bg-card border-border",
              )}
              style={isSelected ? { backgroundColor: category.color } : undefined}
            >
              <CategoryIcon
                icon={category.icon}
                size={compact ? 20 : 22}
                color={isSelected ? "#FFFFFF" : category.color}
                className={cn("shrink-0", !compact && "mb-1")}
              />

              <span
                className={cn(
                  "text-[10px] font-black leading-tight line-clamp-2",
                  isSelected ? "text-white" : "text-text",
                )}
              >
                {category.name}
              </span>
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => setAddCategoryOpen(true)}
          className={cn(
            TILE_BASE,
            tileHeight,
            "gap-1.5 border-2 border-dashed border-border2 bg-card/50",
          )}
        >
          <div
            className="size-6 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: tint(accentColor, 13) }}
          >
            <Plus size={14} strokeWidth={3} style={{ color: accentColor }} />
          </div>
          <span
            className="text-[10px] font-black uppercase tracking-tight text-center px-1"
            style={{ color: accentColor }}
          >
            Thêm mới
          </span>
        </button>
      </div>

      <CategoryFormSheet
        open={addCategoryOpen}
        onClose={() => setAddCategoryOpen(false)}
        onSave={async (data) => {
          const count = await db.categories.count();
          const id = await db.categories.add({
            ...data,
            sortOrder: count,
            color: CATEGORY_COLORS[count % CATEGORY_COLORS.length],
          });
          await useCategoryStore.getState().loadCategories();
          onSelect(id as number);
          setAddCategoryOpen(false);
        }}
      />
    </div>
  );
}
