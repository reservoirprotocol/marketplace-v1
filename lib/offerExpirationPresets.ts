import { DateTime } from 'luxon'

const expirationPresets = [
  {
    preset: 'oneHour',
    value: () =>
      DateTime.now().plus({ hours: 1 }).toMillis().toString().slice(0, -3),
    display: '1 Hour',
  },
  {
    preset: 'oneDay',
    value: () =>
      DateTime.now().plus({ days: 1 }).toMillis().toString().slice(0, -3),
    display: '1 Day',
  },
  {
    preset: 'oneWeek',
    value: () =>
      DateTime.now().plus({ weeks: 1 }).toMillis().toString().slice(0, -3),
    display: '1 Week',
  },
  {
    preset: 'none',
    value: () => '0',
    display: 'None',
  },
]

export default expirationPresets
