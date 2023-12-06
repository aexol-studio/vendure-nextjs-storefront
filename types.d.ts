type UnwrapStaticProps<T> = 'props' extends keyof ReturnType<T> ? ReturnType<T>['props'] : never;

type UnwrapStaticPromiseProps<T> = ReturnType<T> extends Promise<infer R>
    ? 'props' extends keyof R
        ? R['props']
        : never
    : never;
