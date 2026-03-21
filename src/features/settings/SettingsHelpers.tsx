// Shared layout primitives used across Settings sub-components.

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-4 pb-1 pt-4">
      <span className="text-text-hint text-[10px] font-medium uppercase tracking-[1.2px]">
        {children}
      </span>
    </div>
  )
}

export function Divider() {
  return <div className="border-border mx-4 border-t" />
}
