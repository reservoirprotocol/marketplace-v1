import React, {
  ComponentPropsWithoutRef,
  ElementRef,
  forwardRef,
  ReactNode,
} from 'react'
import * as RadixPopover from '@radix-ui/react-popover'

const Arrow = forwardRef<
  ElementRef<typeof RadixPopover.Arrow>,
  ComponentPropsWithoutRef<typeof RadixPopover.Arrow>
>(({ className, ...contentProps }, forwardedRef) => (
  <RadixPopover.Arrow
    ref={forwardedRef}
    {...contentProps}
    className={`h-[7px] w-[15px] fill-neutral-300 ${className}`}
  />
))

Arrow.displayName = 'Popover Arrow'

const Content = forwardRef<
  ElementRef<typeof RadixPopover.Content>,
  ComponentPropsWithoutRef<typeof RadixPopover.Content>
>(({ className, ...contentProps }, forwardedRef) => (
  <RadixPopover.Content
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
} & RadixPopover.PopoverProps

const StyledPopover = ({
  children,
  content,
  side = 'bottom',
  width = '100%',
  ...props
}: Props) => {
  return (
    <RadixPopover.Root {...props}>
      <RadixPopover.Trigger
        style={{
          backgroundColor: 'transparent',
          borderWidth: 0,
          cursor: 'pointer',
          padding: 0,
        }}
      >
        {children}
      </RadixPopover.Trigger>
      <RadixPopover.Content side={side}>
        <RadixPopover.Arrow />
        <div
          className={`max-h-[322px] max-w-[320px] overflow-y-auto p-3 w-${width} rounded-[10px] bg-neutral-800`}
        >
          {content}
        </div>
      </RadixPopover.Content>
    </RadixPopover.Root>
  )
}

StyledPopover.Root = RadixPopover.Root
StyledPopover.Trigger = RadixPopover.Trigger
StyledPopover.Arrow = Arrow
StyledPopover.Content = Content

export default StyledPopover
