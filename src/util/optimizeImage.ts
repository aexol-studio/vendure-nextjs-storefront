type ImageSize = 'thumbnail' | 'tile' | 'popup' | 'detail' | 'full' | 'thumbnail-big';

type CustomImageSize = {
    width: number;
    height: number;
    mode: 'resize' | 'crop';
    format: 'webp' | 'jpg';
};

type OptimizeImage = {
    size: ImageSize | CustomImageSize;
    src?: string;
};

export const optimizeImage = ({ size, src }: OptimizeImage) => {
    if (typeof size === 'object') {
        const { width, height, mode, format } = size;
        return `${src}?w=${width}&h=${height}&mode=${mode}&format=${format}`;
    }

    switch (size) {
        case 'thumbnail':
            src += '?w=200&h=200&mode=crop&format=webp';
            break;
        case 'thumbnail-big':
            src += '?w=400&h=400&mode=resize&format=webp';
            break;
        case 'tile':
            src += '?w=400&h=400&mode=resize&format=webp';
            break;
        case 'popup':
            src += '?w=600&h=600&mode=resize&format=webp';
            break;
        case 'detail':
            src += '?w=800&h=800&mode=resize&format=webp';
            break;
        case 'full':
            src += '?w=1200&h=1200&mode=resize&format=webp';
            break;
        default:
            break;
    }

    return src;
};
