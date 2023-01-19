import Toast from 'components/Toast'
import { ComponentProps } from 'react'
import toast from 'react-hot-toast'

export const setToast: (data: ComponentProps<typeof Toast>['data']) => any = (
  data
) => toast.custom((t) => <Toast t={t} toast={toast} data={data} />)
