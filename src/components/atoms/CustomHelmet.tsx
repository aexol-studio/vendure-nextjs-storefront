import Head from 'next/head';

export const CustomHelmet: React.FC<{ pageTitle?: string }> = ({ pageTitle }) => {
    return (
        <Head>
            <title>{pageTitle ? pageTitle : 'Your Title'}</title>
            <meta name="description" content="description." />
            <meta property="keywords" content="keywords" />

            <meta
                property="og:image"
                content="https://yourdomain/images/jpg/ogImage.jpg" // public/images/....
            />
            <meta name="og:title" content="og title" />
            <meta property="og:site_name" content="og site name" />
            <meta property="og:type" content="website" />
            <meta property="og:description" content="og desc." />
            <meta property="og:url" content="https://yourdomain.pl123" />
            <meta property="article:publisher" content="https://www.facebook.com/youraddress123123123" />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content="twitter title" />
            <meta name="twitter:description" content="twitter desc" />
            <meta name="twitter:url" content="https://yourdomain.pl123" />
        </Head>
    );
};
