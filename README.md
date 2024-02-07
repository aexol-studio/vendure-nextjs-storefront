# Vendure NextJS Storefront
This is a NextJS starter for Vendure in the shape of a demo e-commerce shop. It's still in **alpha**, but feel free to read the concepts, run the store locally or just check out how it works at [shop.aexol.com](https://shop.aexol.com).

## Installation

1. Clone this repo via SSH, HTTPS or the GitHub CLI.
2. Install packages using ```npm i```
3. Run locally using ```npm run dev```

> [!IMPORTANT]
> **Reminder: you need to also have the Vendure store running locally to use this storefront** 

> [!TIP]
> You can read about how to set that up in the Vendure Server section below

## Table of contents
- [Vendure NextJS Storefront](#vendure-nextjs-storefront)
  - [Installation](#installation)
  - [Table of contents](#table-of-contents)
  - [Vendure Server](#vendure-server)
  - [Zeus](#zeus)
  - [Page naming convention](#page-naming-convention)
  - [Internationalization with i18next](#internationalization-with-i18next)
  - [Icons](#icons)
  - [Styles](#styles)
  - [Theme](#theme)
  - [Useful Links](#useful-links)
  - [Who?](#who)
  - [Roadmap](#roadmap)


### Vendure Server

This storefront requires a Vendure V2 server. You can either run a local instance, or use our public demo server.

Our demo of Vendure server (MinIO & Postgres & SMTP) can be found [here](https://github.com/aexol-studio/aexol-shop-backend) to see all changes.

For the best experience when using our demo, you'll need to apply some ‘small’ modifications.

Here's a list of those small changes to the Vendure server:

- apply two collections `all` and `search`. Both of them should contain all products (or not? for cases with gift cards / shipping-protections)
- add the stock level as a number value and not as enum values
```ts
export class ExactStockDisplayStrategy implements StockDisplayStrategy {
  getStockLevel(
    ctx: RequestContext,
    productVariant: ProductVariant,
    saleableStockLevel: number
  ): string {
    return saleableStockLevel.toString();
  }
}

export const catalogOptions: VendureConfig["catalogOptions"] = {
  stockDisplayStrategy: new ExactStockDisplayStrategy(),
};
```

## Zeus

We use GraphQL Zeus to provide Selectors for certain GraphQL query parts. You can think of Selectors as fragments in GraphQL, just with the added type-safety.

## Page naming convention

In this starter, we're following a fairly simple naming convention for pages, that aligns with DDD (Domain-driven design) principles. Each page file is named using the format `page-name.page.tsx`, where `page-name` represents the name of the page or route. For example, the main page of your application would be named `index.page.tsx`.
We're also using slug pages for products and collections, where we have a `products` and `collections` folder with a `[slug].page.tsx` where the `[slug]` is replaced by product or collection name fetched from the backend as props. This allows us to dynamically generate those pages at scale, while maintaining a simple to navigate structure with routes like `/collections/electronics/` or `/products/laptop/`.
Using this naming convention helps maintain a clean and organized folder structure that reflects the structure of your application's domains or features. By separating pages into their respective folders and adopting a consistent naming convention, you can easily locate and manage your application's routes and easily navigate any issues that might arise.

## Internationalization with i18next

As most e-commerce shops use localization to reach clients who use different languages we have also added integrated i18next to handle translations. This makes it really easy to add and update translated content. Here's how we use i18next:

1. **Translation Files**: We maintain separate JSON translation files for each supported language. These files contain translation keys and their corresponding localized text.
   For example, you might find the English translation file for home page at `public/locales/en/homePage.json`

2. **Locale Configuration**: We configure i18next to load the appropriate translation files based on the user's selected locale.

3. **Integration with React**: We use the `next-i18next` package to integrate i18next with React components, making it seamless to access translations in your React components via a simple `useTranslation` hook which will then always use the matching translation for the user's selected locale.

```ts
import { useTranslation } from 'next-i18next';

export const Home: React.FC = () => {
    const { t } = useTranslation('homepage');

    return (
        <Layout>
                <Hero
                    cta={t('hero-cta')}
                    h1={t('hero-h1')}
                    h2={t('hero-h2')}
                    desc={t('hero-p')}
                    link="/collections/all"
                />
        </Layout>
    );
};
```
> [!TIP]
> For quick localization you can use [DevTranslate](https://devtranslate.app) to translate json files into up to 28 languages at the same time.


## Icons

Lucide icons is an open source library which contains over one thousand svg icons and symbols separated into official packages, to make it easier to pick one for your project. Head on over to [lucide.dev](https://lucide.dev/) and check them out yourself.

## Styles

We really like using [Tailwind](https://tailwindcss.com/) - that's why we are building our own engine based on styled components with props that work similarly to Tailwind. For example here's our `Stack` component:

```tsx
export const Stack = styled.div<BaseFlexParams>`
    gap: ${p => p.gap || 0};
    display: flex;
    flex-direction: ${p => (p.column ? (p.reverse ? 'column-reverse' : 'column') : p.reverse ? 'row-reverse' : 'row')};
    flex-wrap: ${p => (p.flexWrap ? 'wrap' : 'nowrap')};
    justify-content: ${p =>
        p.justifyBetween ? 'space-between' : p.justifyCenter ? 'center' : p.justifyEnd ? 'end' : 'start'};
    align-items: ${p => (p.itemsCenter ? 'center' : 'initial')};
`;
```

With the props set up like that you can then use it almost like you would with Tailwind (just without `ClassName`):
```tsx
<Stack column gap="2rem">
  {children}
</Stack>
```

## Theme
Theming is provided by [Emotion](https://emotion.sh/docs/introduction) and some generic functions.

You can use values from the theme with `thv` which returns a function that consumes the theme and returns just the value or the usual method with `${p => p.theme}`. You can see both uses in the example below:

```tsx
import { thv } from '@/src/theme';
import styled from '@emotion/styled';

export const IconButton = styled.button<{ isActive?: boolean }>`
    color: ${thv.button.icon.front};
    border: 0;
    border-radius: 100%;
    font-weight: 600;
    outline: 0;
    width: 2.4rem;
    height: 2.4rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${p => p.theme.button.icon.back || 'transparent'};
    svg {
        width: 2rem;
        height: 2rem;
    }
    :hover {
        box-shadow: none;
    }
`;

```

## Useful Links

- [Zeus Documentation](https://graphqleditor.com/docs/tools/zeus/basics/getting-started/)
- [i18next Documentation](https://www.i18next.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://reactjs.org/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

## Who are the authors?

We are devs and contributors to the GraphQL ecosystem with a lot of experience and we want to enter Vendure to create developer-friendly e-commerce solutions that don't rely on clunky and outdated stuff like Shopify's Liquid wrapped with JavaScript.

## Roadmap

- [ ] Finish this starter
- [X] Deployment of the storefront connected to demo shop
- [X] Basic Cart functionality
- [X] Basic Checkout process
- [ ] Design implementation
- [X] Basic Payment process
- [X] Basic User Profile
- [X] Search products
- [X] Filters
- [ ] Localization with devtranslate.app
- [ ] Adding Static Git CMS MDTX
- [ ] Configure SEO and schema.org for every site
- [ ] Assure ISR ready on every sub site
- [ ] Migrate to the new next router