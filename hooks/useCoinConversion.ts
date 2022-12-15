import fetcher from 'lib/fetcher'
import useSWR from 'swr'

export default function useCoinConversion(
  vs_currency?: string,
  symbols: string = 'eth'
) {
  const { data } = useSWR(
    vs_currency
      ? `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${vs_currency}&symbols=${symbols}`
      : null,
    fetcher,
    {
      refreshInterval: 60 * 1000 * 5, //5m Interval
      revalidateOnFocus: false,
      refreshWhenHidden: false,
    }
  )

  if (data && data[0] && data[0].current_price) {
    return data[0].current_price as number
  }
  return null
}
