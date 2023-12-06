import 'next-i18next';
import resources from '@/src/@types/resources';

declare module 'i18next' {
    interface CustomTypeOptions {
        resources: typeof resources;
    }
}
