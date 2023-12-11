import { ProductDetailsFacetType } from '../graphql/selectors';

/**
 *
 * @param language - choosen language
 *
 * @param facets - facets array
 * @returns translated facets names for choosen language
 */

export const translateProductFacetsNames = (language: string, facets?: ProductDetailsFacetType[]) => {
    if (!facets) return [];
    return facets.map(facet => {
        const translatedFacet = facet.translations.find(translation => translation.languageCode === language);
        return translatedFacet ?? { name: facet.name, id: facet.id };
    });
};
