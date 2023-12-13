# Vendure NextJS Storefront
This is NextJS starter for Vendure. This is still in **alpha**, but feel free to read the concepts and run the store.

## Installation

1. Clone this repo
2. ```npm i```
3. ```npm run dev```

Just remember you need to have the Vendure store running locally to use this storefront.

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

## Zeus

We use zeus to provide Selectors for certain GraphQL query parts. You can think about Selectors like fragments in GraphQL, but type-safe

## Page naming convention

In this starter, we follow a naming convention for pages that aligns with DDD (Domain-driven design) principles. Each page file is named using the format `page-name.page.tsx`, where `page-name` represents the name of the page or route. For example, the main page of your application could be named `index.page.tsx`.
Using this naming convention helps maintain a clean and organized folder structure that reflects the structure of your application's domains or features. By separating pages into their respective folders and adopting a consistent naming convention, you can easily locate and manage your application's routes.

## Internationalization with i18next

In this project, we have integrated i18next to make it easy for you to create multi-language websites. Here's how we use i18next:

1. **Translation Files**: We maintain separate JSON translation files for each supported language. These files contain translation keys and their corresponding localized text.
   For example, you might find the English translation file for home page at `public/locales/en/homePage.json`

2. **Locale Configuration**: We configure i18next to load the appropriate translation files based on the user's selected locale.

3. **Integration with React**: We use the `react-i18next` package to integrate i18next with React components, making it seamless to access translations in your React components.

## Icons

Lucide icons

## Styles

I really like tailwind - that's why we are building our own engine based on styled components with props like in tailwind. For example `Stack`:

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

So you can use it as follows:
```tsx
<Stack column gap="2rem">
  {children}
</Stack>
```

## Theme
Theming is provided by emotion and some generic functions.

You can use values from the theme with `thv` function or standard emotion way.

`thv.button.icon.front` returns function that consumes the theme and returns the value. It is a small shortcut frm `${p => p.theme}`

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

## Who?

We are contributors to the GraphQL Ecosystem so far and we want to enter vendure.

## Roadmap

- [ ] Finish this starter
- [ ] Deployment of the storefront connected to demo shop
- [ ] Cart functionality
- [ ] Checkout process
- [ ] Design implementation
- [ ] Payment process
- [ ] User Profile
- [ ] Search products
- [ ] Filters
- [ ] Localization with devtranslate.app
- [ ] Adding Static Git CMS MDTX
- [ ] Configure SEO and schema.org for every site
- [ ] Assure ISR ready on every sub site
- [ ] Migrate to the new next router