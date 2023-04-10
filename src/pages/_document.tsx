import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
    return (
        <Html lang="en" style={{ backgroundColor: '#000F18' }}>
            <Head>
                <link
                    rel="stylesheet"
                    href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
                />
            </Head>
            <body>
                <main style={{ backgroundColor: '#000F18' }}>
                    <Main />
                </main>
                <NextScript />
            </body>
        </Html>
    )
}
