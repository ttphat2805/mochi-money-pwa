import * as React from "react";
import { Switch as SwitchPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer inline-flex shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-accent data-[state=unchecked]:bg-surface2",
        className
      )}
      style={{ width: '46px', minWidth: '46px', height: '26px', minHeight: '26px' }}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "custom-switch-thumb pointer-events-none block rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ease-out"
        )}
        style={{ width: '20px', height: '20px' }}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
