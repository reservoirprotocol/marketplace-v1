/**
 * Encode an URI component, but replace `%20` with a `+` sign
 *
 * - `foo bar` -> `foo%20bar` -> `foo+bar`
 * @param value an URI component
 * @returns The encoded and replaced URI component
 */
export default function formatUrl(value: string) {
  {
    return encodeURIComponent(value).replace(/%20+/g, '+')
  }
}
