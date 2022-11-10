import { useState, useEffect } from 'react'
import Layout from 'components/Layout'
import type { NextPage } from 'next'
import ReactMarkdown from 'react-markdown'

const Privacy: NextPage = () => {
  const [content, setContent] = useState<string>("");

  useEffect(() => {
    try {
      fetch("/markdown/privacy.md")
        .then((res) => res.text())
        .then((text) => setContent(text))
    } catch (err) {
      console.error(err)
    }
  }, []);

  return (
    <Layout navbar={{}}>
      <header className="col-span-full mb-12 mt-[66px] px-4 md:mt-40 lg:px-0">
        <h1 className="reservoir-h1 text-center dark:text-white">Privacy</h1>
      </header>
      <main className='col-span-full mx-auto flex flex-col max-w-4xl w-full px-6 '>
        <ReactMarkdown className="markdown-support" linkTarget="_blank">
          {content}
        </ReactMarkdown>
      </main>
    </Layout>
  )
}

export default Privacy

