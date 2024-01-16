import { CollectionType, ProductDetailType } from '@/src/graphql/selectors';
import Head from 'next/head';
import { useRouter } from 'next/router';

export const CustomHelmet: React.FC<{
    pageTitle: string;
    product?: ProductDetailType;
    variant?: ProductDetailType['variants'][number];
    collection?: CollectionType;
}> = ({ pageTitle, product, collection, variant }) => {
    const { asPath } = useRouter();
    const jsonLD = generateJSONLD({ product, collection, variant });
    let title = pageTitle;
    if (product && variant) {
        title = `${product.name} | ${pageTitle}`;
    }
    if (collection) {
        title = `${collection.name} | ${pageTitle}`;
    }
    if (title.length > 60) {
        title = pageTitle.slice(0, 60 - 3) + '...';
        // console.log(`title of ${asPath} is too long`);
    }
    const u = new URL((process.env.NEXT_PUBLIC_DOMAIN || 'https://shop.aexol.com') + asPath);
    const canonicalUrl = u.origin + u.pathname;

    let metaDescription = product?.description || collection?.description || 'Demo store made by Aexol';
    if (metaDescription.length > 160) {
        metaDescription = metaDescription.slice(0, 160 - 3) + '...';
        // console.log(`description of ${asPath} is too long`);
    }

    const seo = {
        name: 'Aexol Demo Store',
        description: metaDescription,
        pageUrl: `${asPath}`,
        keywords: [
            'Aexol',
            'Shop',
            'E-commerce',
            'React',
            'Next.js',
            'GraphQL',
            'TypeScript',
            'Demo',
            'Example',
            'Boilerplate',
            product?.name as string,
        ],
        faviconUrl: `/favicon.ico`,
        logo: `/images/aexol_full_logo.png`,
        facebook: 'https://www.facebook.com/Aexol',
        twitter: 'https://twitter.com/aexol',
        image: product?.featuredAsset?.preview || collection?.featuredAsset?.preview || `/images/aexol_full_logo.png`,
    };
    // !seo.keywords.some(keyword => title.includes(keyword)) && console.log(`no keyword in title of ${seo.pageUrl}`);
    // !seo.keywords.some(keyword => seo.description.includes(keyword)) &&
    //     console.log(`no keyword in desc of ${seo.pageUrl}`);
    return (
        <Head>
            <title>{title}</title>
            <link rel="canonical" href={canonicalUrl} />
            <link rel="shortcut icon" href={seo.faviconUrl} type="image/png" />
            <meta name="description" content={seo.description} />
            <meta property="keywords" content={seo.keywords.join(',')} />
            <meta property="og:image" content={seo.image} />
            <meta property="og:image:url" content={seo.image} />

            <meta name="og:title" content={title} />
            <meta property="og:site_name" content={seo.name} />
            <meta property="og:type" content="website" />
            <meta property="og:description" content={seo.description} />
            <meta property="og:url" content={seo.pageUrl} />

            {product?.variants[0].priceWithTax && (
                <meta property="og:price:amount" content={`${product.variants[0].priceWithTax}`} />
            )}
            {product?.variants[0].currencyCode && (
                <meta property="og:price:currency" content={`${product.variants[0].currencyCode}`} />
            )}

            <meta property="article:publisher" content={seo.facebook} />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={seo.name} />
            <meta name="twitter:description" content={seo.description} />
            <meta name="twitter:url" content={seo.twitter} />

            {jsonLD && <script type="application/ld+json" dangerouslySetInnerHTML={jsonLD} />}
        </Head>
    );
};

const doProductLD = (product: ProductDetailType) => {
    return {
        '@context': 'https://schema.org/',
        '@type': 'Product',
        name: product.name,
        image: product.featuredAsset?.preview,
        description: product.description,
        // brand: {
        //     '@type': 'Brand',
        //     name: 'Brand Name',
        // },
        //   aggregateRating: {
        //       '@type': 'AggregateRating',
        //       ratingValue: '4.4',
        //       reviewCount: '89',
        //   },
        offers: {
            '@type': 'Offer',
            priceCurrency: product.variants[0].currencyCode,
            price: product.variants[0].priceWithTax,
            itemCondition: 'http://schema.org/UsedCondition',
            availability:
                Number(product.variants[0].stockLevel) > 0
                    ? 'http://schema.org/OutOfStock'
                    : 'http://schema.org/InStock',
            //   seller: {
            //       '@type': 'Organization',
            //       name: 'Seller Name',
            //   },
        },
    };
};
const doCollectionLD = (collection: CollectionType) => {
    return {
        '@context': 'https://schema.org/',
        '@type': 'CollectionPage',
        name: collection.name,
        description: collection.description,
        image: collection.featuredAsset?.preview,
    };
};
const doStoreLD = () => {
    return {
        '@context': 'https://schema.org/',
        '@type': 'OnlineStore',
        name: 'Aexol demo shop',
        description: 'Aexol demo shop is for demonstration purposes, change des to fit your usecase',
        image: '/images/aexol_full_logo.png',
        parentOrganization: {
            '@type': 'OnlineBusiness',
            name: 'Aexol',
            url: 'http://aexol.com/',
        },
    };
};
const generateJSONLD = ({
    product,
    collection,
    variant,
}: {
    product?: ProductDetailType;
    collection?: CollectionType;
    variant?: ProductDetailType['variants'][number];
}) => {
    let __html = JSON.stringify(doStoreLD);
    try {
        if (product && variant) {
            __html = JSON.stringify(doProductLD(product));
        } else if (collection) {
            __html = JSON.stringify(doCollectionLD(collection));
        } else {
            __html = JSON.stringify(doStoreLD());
        }
    } catch (err) {
        console.log(err);
    }
    return __html ? { __html } : null;
};
