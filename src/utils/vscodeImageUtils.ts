/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';

const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff'];
export async function getBufferAndMimeTypeFromUri(uri: vscode.Uri): Promise<{ buffer: Buffer, mimeType: string } | undefined> {
    const fileExtension = uri.path.split('.').pop()?.toLowerCase();
    if (!fileExtension || !imageExtensions.includes(fileExtension)) {
        return;
    }

    const buffer = Buffer.from(await vscode.workspace.fs.readFile(uri));
    const mimeType = getMimeType(fileExtension);
    return { buffer, mimeType };
}

function getMimeType(ext: string) {
    if (ext === 'jpg') {
        return 'image/jpeg';
    }
    return `image/${ext}`;
}

