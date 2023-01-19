import { FaChevronDown } from 'react-icons/fa'
import { keyframes, styled } from '@stitches/react'
import * as Accordion from '@radix-ui/react-accordion'

const slideDown = keyframes({
  from: { height: 0 },
  to: { height: 'var(--radix-accordion-content-height)' },
})

const slideUp = keyframes({
  from: { height: 'var(--radix-accordion-content-height)' },
  to: { height: 0 },
})
export const StyledChevron = styled(FaChevronDown, {
  transition: 'transform 300ms cubic-bezier(0.87, 0, 0.13, 1)',
  '[data-state=open] &': { transform: 'rotate(180deg)' },
})

export const StyledContent = styled(Accordion.Content, {
  '&[data-state="open"]': {
    marginTop: '16px',
    animation: `${slideDown} 300ms cubic-bezier(0.87, 0, 0.13, 1)`,
  },
  '&[data-state="closed"]': {
    opacity: 0,
    animation: `${slideUp} 300ms cubic-bezier(0.87, 0, 0.13, 1)`,
  },
})
