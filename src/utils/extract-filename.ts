import { InternalServerErrorException } from '@nestjs/common';

export function extractTitleFromDocumentPdf(filename: string): string {
    const MESSAGE_EXTRACT_TITLE_ERROR = 'error to extract title file name';
    let formatedFile = '';

    try {
        const copyIndexRegex = /\s?\(\d+\)/g;
        formatedFile = filename.replace(copyIndexRegex, '').replace('.pdf', '').trim();
    } catch (e) {
        console.error(MESSAGE_EXTRACT_TITLE_ERROR, e);
        throw new InternalServerErrorException(MESSAGE_EXTRACT_TITLE_ERROR);
    } finally {
        return formatedFile;
    }
}
