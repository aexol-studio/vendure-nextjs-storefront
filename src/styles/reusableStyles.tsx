import styled from '@emotion/styled';

export const HoverMenu = styled.div<{ customerMenu?: boolean; langSwitcher?: boolean }>`
    display: block;
    opacity: 0;
    visibility: hidden;
    position: absolute;
    z-index: 3;
    background-color: gray;
    color: white;
    transition: all 0.4s ease-in-out;
    width: max-content;
    transform: translate(-4rem, 15px);
    border-radius: 6px;
    box-shadow: 0px 0px 12px 0px rgba(0, 0, 0, 0.15);

    a:last-of-type {
        div {
            margin-bottom: 0;
        }
    }

    p {
        margin-right: 0px;
        font-size: 1.6rem;
    }

    ${({ customerMenu }) =>
        customerMenu &&
        `
        padding: 16px;
        right: 0;
        transform: none;
    `}

    ${({ langSwitcher }) =>
        langSwitcher &&
        `
      left: 50%;
      top: 2.2rem;
      transform: translate(-50%, 15px);
      padding: 2rem;

      svg {
        height: 16px;
      }
  `}
`;

export const DropdownItem = styled.a`
    display: flex;
    cursor: pointer;
    width: 100%;

    svg {
        height: 2.6rem;
        margin-right: 10px;
        transform: translateY(2px);
    }

    h5,
    p {
        transition: 0.3s all ease-in-out;
    }

    h5 {
        font-size: 1.8rem;
        line-height: 1.8rem;
    }
`;

export const Dropdown = styled.div`
    font-size: 1.8rem;
    position: relative;

    & > p {
        display: inline;
    }

    h5 {
        text-align: left;
    }

    &:hover {
        color: blue;
        div {
            opacity: 1;
            visibility: visible;
        }
        /* svg:not(.no-default-fill) path {
            fill: blue;
        } */
    }

    &.hide div:last-of-type {
        display: none;
    }
`;
