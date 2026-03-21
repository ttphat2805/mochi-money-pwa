import { Switch } from '@/components/ui/switch'
import { HourPicker } from '@/components/HourPicker'
import { SettingsRow } from './SettingsRow'
import { useNotifications } from '@/hooks/useNotifications'

function Divider() {
  return <div className="border-border mx-4 border-t" />
}


export function NotificationSettings() {
  const {
    enabled,
    hour,
    permission,
    isSupported,
    isInstalled,
    enable,
    disable,
    setHour,
  } = useNotifications()

  const handleToggle = (checked: boolean) => {
    if (checked) {
      void enable()
    } else {
      disable()
    }
  }

  return (
    <div>
      {/* Not installed warning */}
      {isSupported && !isInstalled && (
        <div className="mx-4 mb-2 rounded-xl border border-[#F5D080] bg-accent-bg p-3">
          <p className="text-[12px] text-accent-dark font-medium">
            📲 Cần cài app lên màn hình chính để dùng thông báo
          </p>
          <p className="text-text-muted mt-0.5 text-[11px]">
            Tap Share → Add to Home Screen trong Safari
          </p>
        </div>
      )}

      {/* Permission denied warning */}
      {permission === 'denied' && (
        <div className="mx-4 mb-2 rounded-xl border border-danger-bg bg-danger-bg p-3">
          <p className="text-[12px] text-danger font-medium">
            Thông báo bị chặn
          </p>
          <p className="text-text-muted mt-0.5 text-[11px]">
            Vào Cài đặt iPhone → Safari → Thông báo → cho phép
          </p>
        </div>
      )}

      {/* Toggle row */}
      <div className="bg-white mx-4 rounded-xl overflow-hidden border border-border">
        <SettingsRow
          icon="🔔"
          label="Nhắc chi tiêu hằng ngày"
          sublabel={
            enabled
              ? `Nhắc lúc ${hour}:00 mỗi sáng`
              : 'Nhắc xác nhận recurring'
          }
          rightSlot={
            <Switch
              checked={enabled}
              onCheckedChange={handleToggle}
              disabled={!isSupported || permission === 'denied'}
              aria-label={enabled ? 'Tắt thông báo' : 'Bật thông báo'}
            />
          }
        />

        {/* Hour picker — only when enabled */}
        {enabled && (
          <>
            <Divider />
            <div className="flex items-center gap-3 px-4 py-3">
              <span className="text-lg leading-none">⏰</span>
              <div className="flex-1">
                <p className="text-[14px] font-medium mb-2">Giờ nhắc</p>
                <HourPicker value={hour} onChange={setHour} />
              </div>
            </div>
          </>
        )}
      </div>

      {/* iOS 16.4 footnote */}
      {isSupported && (
        <p className="mx-4 mt-2 text-text-hint text-[10px]">
          Yêu cầu iOS 16.4+ và cài app lên màn hình chính
        </p>
      )}
    </div>
  )
}
