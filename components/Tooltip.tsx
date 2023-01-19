import React, {
  ComponentPropsWithoutRef,
  ElementRef,
  forwardRef,
  ReactNode,
} from 'react'
import * as RadixTooltip from '@radix-ui/react-tooltip'

const Arrow = forwardRef<
  ElementRef<typeof RadixTooltip.Arrow>,
  ComponentPropsWithoutRef<typeof RadixTooltip.Arrow>
>(({ className, ...contentProps }, forwardedRef) => (
  <RadixTooltip.Arrow
    ref={forwardedRef}
    {...contentProps}
    className={`h-[7px] w-[15px] fill-neutral-300 ${className}`}
  />
))

Arrow.displayName = 'Popover Arrow'

const Content = forwardRef<
  ElementRef<typeof RadixTooltip.Content>,
  ComponentPropsWithoutRef<typeof RadixTooltip.Content>
>(({ className, ...contentProps }, forwardedRef) => (
  <RadixTooltip.Content
    ref={forwardedRef}
    {...contentProps}
    className={`z-[1000] drop-shadow-[0_2px_16px_rgba(0,0,0,0.75)] ${className}`}
  />
))

Content.displayName = 'Popover Content'

type Props = {
  content?: ReactNode
  side?: any
  width?: any
} & RadixTooltip.TooltipProps

const StyledTooltip = ({
  children,
  content,
  side = 'bottom',
  width = '100%',
  ...props
}: Props) => {
  return (
    <RadixTooltip.Provider delayDuration={0}>
      <RadixTooltip.Root {...props}>
        <RadixTooltip.Trigger
          style={{
            backgroundColor: 'transparent',
            borderWidth: 0,
            cursor: 'pointer',
            padding: 0,
          }}
        >
          {children}
        </RadixTooltip.Trigger>
        <RadixTooltip.Content side={side}>
          <RadixTooltip.Arrow />
          <div
            className={`max-h-[322px] max-w-[320px] overflow-y-auto p-3 w-${width} rounded-[10px] bg-neutral-800`}
          >
            {content}
          </div>
        </RadixTooltip.Content>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  )
}

StyledTooltip.Provider = RadixTooltip.Provider
StyledTooltip.Root = RadixTooltip.Root
StyledTooltip.Trigger = RadixTooltip.Trigger
StyledTooltip.Arrow = Arrow
StyledTooltip.Content = Content

export default StyledTooltip
