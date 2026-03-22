import { useEffect, useState, lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { BottomNav, type TabKey } from "@/components/BottomNav";
import { QuickAddSheet } from "@/features/quick-add/QuickAddSheet";
import { useQuickAdd } from "@/hooks/useQuickAdd";
import { seedDefaultCategories } from "@/lib/seed";
import { useCategoryStore } from "@/stores/categoryStore";
import { HomePage } from "@/features/home/HomePage";
import { SettingsPage } from "@/features/settings/SettingsPage";
import { RecurringListPage } from "@/features/recurring/RecurringListPage";

// Lazy-loaded heavy screens
const CalendarPage = lazy(() =>
  import("@/features/calendar/CalendarPage").then((m) => ({
    default: m.CalendarPage,
  })),
);
const DashboardPage = lazy(() =>
  import("@/features/dashboard/DashboardPage").then((m) => ({
    default: m.DashboardPage,
  })),
);
const BudgetPage = lazy(() =>
  import("@/features/dashboard/BudgetPage").then((m) => ({
    default: m.BudgetPage,
  })),
);

import { FixedExpenseListPage } from "@/features/fixed-expenses/FixedExpenseListPage";
import { FinancialSettingsPage } from "@/features/settings/FinancialSettingsPage";
import { CategoryListPage } from "@/features/settings/CategoryListPage";
import { InstallBanner } from "@/components/InstallBanner";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { checkAndCreateFixedTransactions } from "@/hooks/useFixedExpenses";
import { useRegisterSW } from "virtual:pwa-register/react";
import { usePersonalization } from "@/hooks/usePersonalization";

// ── Navigation types ──────────────────────────────────────────

type Screen =
  | { id: "main"; tab: TabKey }
  | { id: "settings" }
  | { id: "recurring" }
  | { id: "fixedExpenses" }
  | { id: "financialSettings" }
  | { id: "categories" };

// ── App ───────────────────────────────────────────────────────

function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [history, setHistory] = useState<Screen[]>(() => {
    const saved = localStorage.getItem("active-tab") as TabKey;
    return [{ id: "main", tab: saved ?? "home" }];
  });
  const { loadCategories } = useCategoryStore();
  const quickAdd = useQuickAdd();
  const { settings } = usePersonalization();

  useEffect(() => {
    document.title = settings.appName;
  }, [settings.appName]);

  // ── Service worker update detection ──
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  useEffect(() => {
    if (needRefresh) {
      toast("Có bản cập nhật mới", {
        action: {
          label: "Cập nhật",
          onClick: () => updateServiceWorker(true),
        },
        duration: Infinity,
      });
    }
  }, [needRefresh, updateServiceWorker]);

  useEffect(() => {
    const handlePopState = () => {
      setHistory((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const current = history[history.length - 1];
  const push = (screen: Screen) => {
    window.history.pushState({}, "");
    setHistory((prev) => [...prev, screen]);
  };
  const pop = () => {
    if (history.length > 1) {
      window.history.back();
    }
  };

  const setTab = (tab: TabKey) => {
    localStorage.setItem("active-tab", tab);
    setHistory((prev) => {
      const last = prev[prev.length - 1];
      if (last.id === "main")
        return [...prev.slice(0, -1), { id: "main", tab }];
      return [{ id: "main", tab }]; // reset stack when switching tabs from a deep screen
    });
  };

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
                    setTab(tab as any);
                  }
                }}
                onSettings={() => push({ id: "settings" })}
              />
            );
          case "budget":
            return (
              <Suspense
                fallback={
                  <div className="flex h-full items-center justify-center text-sm text-text-muted">
                    Đang tải...
                  </div>
                }
              >
                <BudgetPage onSettings={() => push({ id: "settings" })} />
              </Suspense>
            );
          case "calendar":
            return (
              <Suspense
                fallback={
                  <div className="flex h-full items-center justify-center text-sm text-text-muted">
                    Đang tải...
                  </div>
                }
              >
                <CalendarPage />
              </Suspense>
            );
          case "overview":
            return (
              <Suspense
                fallback={
                  <div className="flex h-full items-center justify-center text-sm text-text-muted">
                    Đang tải...
                  </div>
                }
              >
                <DashboardPage />
              </Suspense>
            );
        }
    }
  };

  return (
    <div className="flex h-full flex-col">
      <OfflineIndicator />
      <div
        className={`flex min-h-0 flex-1 flex-col ${showBottomNav ? "pb-24" : ""}`}
      >
        {renderScreen()}
      </div>

      {showBottomNav && <BottomNav active={activeTab} onTab={setTab} />}

      <QuickAddSheet quickAdd={quickAdd} />
      <InstallBanner />
      <Toaster position="top-center" />
      <SpeedInsights />
    </div>
  );
}

export default App;
