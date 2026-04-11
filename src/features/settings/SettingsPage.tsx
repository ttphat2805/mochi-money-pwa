import { BackButton } from '@/components/BackButton'
import { SettingsRow } from './SettingsRow'
import { SectionLabel } from './SettingsHelpers'
import { DataSettingsSection } from './DataSettingsSection'
import { PersonalizationSettings } from './PersonalizationSettings'

interface SettingsPageProps {
  onBack: () => void
  onGoRecurring: () => void
  onGoFixedExpenses: () => void
  onGoFinancial: () => void
  onGoCategories: () => void
}


export function SettingsPage({ onBack, onGoRecurring, onGoFixedExpenses, onGoFinancial, onGoCategories }: SettingsPageProps) {
  return (
    <div className="flex h-[100dvh] flex-col relative bg-bg">
      {/* Header with Robust Safe Area support */}
      <header className="sticky top-0 z-20 bg-bg/80 backdrop-blur-md border-b border-border/40">
        <div className="safe-top" />
        <div className="flex h-12 items-center gap-2 px-4">
            <div className="w-10 flex items-center">
            <BackButton onBack={onBack} />
            </div>
            <h1 className="flex-1 text-center text-[16px] font-bold text-text">Cài đặt</h1>
            <div className="w-10" />
        </div>
      </header>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto pb-10 scrollbar-hide">
        <SectionLabel>Cá nhân hoá</SectionLabel>
        <PersonalizationSettings />

        {/* Khoản lặp lại */}
        <SectionLabel>Khoản lặp lại</SectionLabel>
        <div className="bg-white mx-4 rounded-xl overflow-hidden border border-border">
          <SettingsRow
            icon="↻"
            label="Quản lý recurring"
            sublabel="Ăn trưa, cafe, xăng xe..."
            onTap={onGoRecurring}
          />
        </div>

        {/* Tài chính */}
        <SectionLabel>Tài chính</SectionLabel>
        <div className="bg-white mx-4 rounded-xl overflow-hidden border border-border">
          <SettingsRow icon="💰" label="Tài chính & Tiết kiệm" sublabel="Thu nhập, mục tiêu..." onTap={onGoFinancial} />
        </div>

        {/* Danh mục */}
        <SectionLabel>Danh mục</SectionLabel>
        <div className="bg-white mx-4 rounded-xl overflow-hidden border border-border">
          <SettingsRow icon="◫" label="Quản lý danh mục" onTap={onGoCategories} />
        </div>

        {/* Chi phí cố định */}
        <SectionLabel>Chi phí cố định</SectionLabel>
        <div className="bg-white mx-4 rounded-xl overflow-hidden border border-border">
          <SettingsRow icon="🏠" label="Chi phí cố định" sublabel="Tiền nhà, điện nước..." onTap={onGoFixedExpenses} />
        </div>

        {/* Dữ liệu */}
        <SectionLabel>Dữ liệu</SectionLabel>
        <DataSettingsSection />
      </div>
    </div>
  )
}
