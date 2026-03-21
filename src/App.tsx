import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { BottomNav, type TabKey } from "@/components/BottomNav";
import { seedDefaultCategories } from "@/lib/seed";
import { useCategoryStore } from "@/stores/categoryStore";
import { HomePage } from "@/features/home/HomePage";
import { SettingsPage } from "@/features/settings/SettingsPage";
import { RecurringListPage } from "@/features/recurring/RecurringListPage";
import { CalendarPage } from "@/features/calendar/CalendarPage";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { FixedExpenseListPage } from "@/features/fixed-expenses/FixedExpenseListPage";
import { FinancialSettingsPage } from "@/features/settings/FinancialSettingsPage";
import { CategoryListPage } from "@/features/settings/CategoryListPage";
import { InstallBanner } from "@/components/InstallBanner";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { checkAndCreateFixedTransactions } from "@/hooks/useFixedExpenses";
import { useRegisterSW } from "virtual:pwa-register/react";

// ── Navigation types ──────────────────────────────────────────

type Screen =
  | { id: "main"; tab: TabKey }
  | { id: "settings" }
  | { id: "recurring" }
  | { id: "fixedExpenses" }
  | { id: "financialSettings" }
  | { id: "categories" };

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2">
      <p className="text-2xl">🚧</p>
      <p className="text-text-muted text-sm">{title} — đang phát triển</p>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────

function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [history, setHistory] = useState<Screen[]>([
    { id: "main", tab: "home" },
  ]);
  const { loadCategories } = useCategoryStore();

  // ── Service worker update detection ──
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  useEffect(() => {
    if (needRefresh) {
      toast('Có bản cập nhật mới', {
        action: {
          label: 'Cập nhật',
          onClick: () => updateServiceWorker(true),
        },
        duration: Infinity,
      });
    }
  }, [needRefresh, updateServiceWorker]);

  const current = history[history.length - 1];
  const push = (screen: Screen) => setHistory((prev) => [...prev, screen]);
  const pop = () =>
    setHistory((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));

  const setTab = (tab: TabKey) =>
    setHistory((prev) => {
      const last = prev[prev.length - 1];
      if (last.id === "main")
        return [...prev.slice(0, -1), { id: "main", tab }];
      return [{ id: "main", tab }]; // reset stack when switching tabs from a deep screen
    });

  useEffect(() => {
    const init = async () => {
      try {
        await seedDefaultCategories();
        await loadCategories();
        // Run idempotent fixed-expense auto-transaction check on every app open
        void checkAndCreateFixedTransactions();
        setIsInitialized(true);
      } catch (e) {
        setInitError((e as Error).message);
      }
    };
    void init();
  }, [loadCategories]);

  if (initError) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="text-center">
          <p className="text-danger text-lg font-semibold">Lỗi khởi tạo</p>
          <p className="text-text-muted mt-2 text-sm">{initError}</p>
        </div>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-text-muted text-sm">Đang tải...</p>
      </div>
    );
  }

  // Determine if bottom nav should show (only on main tab screens)
  const showBottomNav = current.id === "main";
  const activeTab = current.id === "main" ? current.tab : "home";

  const renderScreen = () => {
    switch (current.id) {
      case "settings":
        return (
          <SettingsPage
            onBack={pop}
            onGoRecurring={() => push({ id: "recurring" })}
            onGoFixedExpenses={() => push({ id: "fixedExpenses" })}
            onGoFinancial={() => push({ id: "financialSettings" })}
            onGoCategories={() => push({ id: "categories" })}
          />
        );
      case "recurring":
        return <RecurringListPage onBack={pop} />;
      case "fixedExpenses":
        return <FixedExpenseListPage onBack={pop} />;
      case "financialSettings":
        return <FinancialSettingsPage onBack={pop} />;
      case "categories":
        return <CategoryListPage onBack={pop} />;
      case "main":
        switch (current.tab) {
          case "home":
            return (
              <HomePage
                onNavigate={(tab) => {
                  if (tab === "overview") {
                    push({ id: "settings" });
                  } else {
                    setTab(tab);
                  }
                }}
                onSettings={() => push({ id: "settings" })}
              />
            );
          case "today":
            return <PlaceholderPage title="Lặp lại hôm nay" />;
          case "calendar":
            return <CalendarPage />;
          case "overview":
            return <DashboardPage />;
        }
    }
  };

  return (
    <div className="flex h-full flex-col">
      <OfflineIndicator />
      <div className="flex min-h-0 flex-1 flex-col">{renderScreen()}</div>

      {showBottomNav && <BottomNav active={activeTab} onTab={setTab} />}

      <InstallBanner />
      <Toaster position="top-center" />
    </div>
  );
}

export default App;
