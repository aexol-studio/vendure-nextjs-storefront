import styled from '@emotion/styled';

export const Label = styled.label`
    text-transform: capitalize;
    font-size: 1.25rem;
    line-height: 1.25rem;
    font-weight: 400;

    & > a {
        color: ${p => p.theme.accent(800)};
        text-decoration: none;
        font-weight: 500;
        font-size: 1.25rem;
        text-decoration: underline;
    }
`;
