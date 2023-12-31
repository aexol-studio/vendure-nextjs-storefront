import { CollectionType, ProductDetailType } from '@/src/graphql/selectors';
import Head from 'next/head';
import { useRouter } from 'next/router';

const SHOP_URL = 'https://yourdomain.pl';

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
        title = `${product.name} ${toUpperCase(variant.name.replace(product.name, ''))} | ${pageTitle}`;
    }
    if (collection) {
        title = `${collection.name} | ${pageTitle}`;
    }

    const seo = {
        name: 'Your Shop Name',
        description: product?.description || collection?.description || 'Your Shop Description',
        pageUrl: `${SHOP_URL}${asPath}`,
        keywords: 'keywords',
        faviconUrl: `${SHOP_URL}/images/png/favicon.png`,
        logo: `${SHOP_URL}/images/png/logo.png`,
        facebook: 'https://www.facebook.com/youraddress123123123',
        twitter: 'https://twitter.com/youraddress123123123',
        image:
            product?.featuredAsset?.preview ||
            collection?.featuredAsset?.preview ||
            `${SHOP_URL}/images/jpg/ogImage.jpg`,
    };

    return (
        <Head>
            <title>{title}</title>
            <link rel="canonical" href={seo.pageUrl} />
            <link rel="shortcut icon" href={seo.faviconUrl} type="image/png" />
            <meta name="description" content={seo.description} />
            <meta property="keywords" content={seo.keywords} />
            <meta property="og:image" content={seo.image} />
            <meta property="og:image:url" content={seo.image} />

            <meta name="og:title" content={seo.name} />
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

const toUpperCase = (str: string) => str.trim().charAt(0).toUpperCase() + str.trim().slice(1);
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
const generateJSONLD = ({
    product,
    collection,
    variant,
}: {
    product?: ProductDetailType;
    collection?: CollectionType;
    variant?: ProductDetailType['variants'][number];
}) => {
    let __html = '';
    try {
        if (product && variant) __html = JSON.stringify(doProductLD(product));
        if (collection) __html = JSON.stringify(doCollectionLD(collection));
    } catch (err) {
        console.error(err);
    }
    return __html ? { __html } : null;
};
