import { MainTheme } from './theme';

import '@emotion/react';

declare module '@emotion/react' {
    export interface Theme extends MainTheme {}
}
