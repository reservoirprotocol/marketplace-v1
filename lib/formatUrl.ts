export default function formatUrl(value: string) {{
    return encodeURIComponent(value).replace(/%20+/g,"+")
}}