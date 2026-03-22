import { BackButton } from '@/components/BackButton'
import { SettingsRow } from './SettingsRow'
import { SectionLabel } from './SettingsHelpers'
import { NotificationSettings } from './NotificationSettings'
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
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 safe-top">
        <BackButton onBack={onBack} />
        <h1 className="flex-1 text-center text-base font-semibold">Cài đặt</h1>
        <div className="size-8" /> {/* spacer */}
      </header>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto pb-8">
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



        {/* Thông báo — live component with permission flow */}
        <SectionLabel>Thông báo</SectionLabel>
        <NotificationSettings />

        {/* Dữ liệu */}
        <SectionLabel>Dữ liệu</SectionLabel>
        <DataSettingsSection />
      </div>
    </div>
  )
}
