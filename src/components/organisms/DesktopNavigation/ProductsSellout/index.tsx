import { NavigationType } from '@/src/graphql/selectors';
import { RootNode } from '@/src/util/arrayToTree';
import React from 'react';
import { Link, Price, Stack, TP } from '@/src/components/atoms';
import { Slider } from '../../Slider';
import styled from '@emotion/styled';
import { CurrencyCode } from '@/src/zeus';
import { ProductImageWithInfo } from '@/src/components/molecules/ProductImageWithInfo';
import { Button } from '@/src/components/molecules/Button';
import { useCart } from '@/src/state/cart';

type SliderItem = {
    id: string;
    title: string;
    variant?: string;
    image: string;
    href: string;
    price: number;
    currencyCode: CurrencyCode;
};

export const ProductsSellout: React.FC<{
    title: string;
    addToCart: ReturnType<typeof useCart>['addToCart'];
    addToCartLabel: string;
    collection: RootNode<NavigationType>['children'][number];
}> = ({ title, addToCart, addToCartLabel, collection }) => {
    if (!collection || collection?.children?.length === 0) return null;
    if (collection.children.some(child => child.productVariants?.items.length === 0)) return null;

    const slides = collection.children
        .reduce((acc, children) => {
            if ('productVariants' in children) {
                const variants = children.productVariants?.items.map(variant => {
                    const optionInName = variant.name.replace(variant.product.name, '') !== '';
                    return {
                        id: variant.id,
                        title: variant.product.name,
                        variant: optionInName ? variant.name : undefined,
                        image: variant.product.featuredAsset?.preview || '',
                        href: `/products/${variant.product.slug}`,
                        price: variant.priceWithTax,
                        currencyCode: variant.currencyCode,
                    };
                });
                if (variants) acc.push(...variants);
            }
            return acc;
        }, [] as SliderItem[])
        .map((val, index) => (
            <Slide justifyBetween column key={index} gap="2rem">
                <Stack w100 column gap="0.5rem">
                    <Relative>
                        <ProductImageWithInfo
                            size="thumbnail-big"
                            href={val.href}
                            imageSrc={val.image}
                            alt={val.title}
                            title={val.title}
                        />
                        {val.variant && (
                            <Absolute w100 itemsCenter justifyCenter>
                                <TP size="1.25rem" weight={400}>
                                    {val.variant.replace(val.title, '')}
                                </TP>
                            </Absolute>
                        )}
                    </Relative>
                    <Link href={val.href}>
                        {val.title && (
                            <TP size="1.5rem" weight={500}>
                                {val.title}
                            </TP>
                        )}
                        {val.price && val.currencyCode && <Price currencyCode={val.currencyCode} price={val.price} />}
                    </Link>
                </Stack>
                <Button onClick={async () => await addToCart(val.id, 1, true)}>{addToCartLabel}</Button>
            </Slide>
        ));

    return (
        <Stack column gap="1.5rem">
            <TP size="1.5rem" weight={500}>
                {title}
            </TP>
            <MaxWidth>
                <Slider spacing={16} withDots slides={slides} />
            </MaxWidth>
        </Stack>
    );
};

const Slide = styled(Stack)`
    width: 16rem;
    height: 100%;

    button {
        width: 100%;
        white-space: nowrap;
    }
`;

const Relative = styled.div`
    position: relative;
`;

const MaxWidth = styled.div`
    max-width: 42rem;
`;

const Absolute = styled(Stack)`
    position: absolute;
    bottom: 0;
    left: 0;
    background: ${p => p.theme.grayAlpha(700, 0.4)};
    padding: 0.5rem 0;
    color: ${p => p.theme.gray(0)};
`;
