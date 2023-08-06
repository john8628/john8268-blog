import 'nextra-theme-blog/style.css'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import '../styles/main.css'

export default function App({ Component, pageProps }: AppProps) {

  const getAnalyticsTag = () => {
    return {
      __html: `
      var _hmt = _hmt || [];
      (function() {
        var hm = document.createElement("script");
        hm.src = "https://hm.baidu.com/hm.js?你的代码";
        var s = document.getElementsByTagName("script")[0];
        s.parentNode.insertBefore(hm, s);
      })();`,
    }
  }
  return (
    <>
      <Head>
        <link
          rel="alternate"
          type="application/rss+xml"
          title="RSS"
          href="/feed.xml"
        />
        <link
          rel="preload"
          href="/fonts/Inter-roman.latin.var.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      
        <script dangerouslySetInnerHTML={getAnalyticsTag()}/>
      
      </Head>
      <Component {...pageProps} />
    </>
  )
}
