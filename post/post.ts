import { api, APIError } from "encore.dev/api";
import { getBookContent, getImageContent } from "../Services/Gemini";
import { saveBookFromURL } from "../utils/File";
import { ElasticSearch } from "../Services/ElasticSearch";
import crypto from 'crypto';
import { readFile } from "fs/promises";
import { paginate } from "../utils/utils";
interface AddPostParams{
    files: {
        mimetype: string;
        url: string;
    }[],
    content: string;

}

export const addPost = api({
    method: [ "POST" ],
    auth: false,
    expose: true,
    path:'/post'
}, async (post: AddPostParams) => {
    
    const postid = `POS_${crypto.randomBytes(16).toString('hex')}`;
    const pdfs = post.files.filter(file => file.mimetype.includes('pdf'));
    if (pdfs.length > 2) {
        return APIError.outOfRange('Only 2 pdfs are allowed');
    }
    for (const pdf of pdfs) {
        const input = await saveBookFromURL(pdf.url);
        const content = await getBookContent(input);
        await ElasticSearch.insertBulk({
            index: 'documents',
            body: content.map((page, index) => ({
                postid: postid,
                content: page,
                page: index,
                document_id: `DOC_${crypto.randomBytes(16).toString('hex')}`
            }))
        });
    }


    const images = post.files.filter(file => file.mimetype.includes('image'));
    if (images.length > 5) {
        return APIError.outOfRange('Only 5 images are allowed');
    } 
    const imagePages = paginate(images, 5);
    for (const imagePage of imagePages) {
        const images = await Promise.all(imagePage.map(async image => { 
            const input = await saveBookFromURL(image.url);
            return {
                inlineData: {
                    data: (await readFile(input, {
                        encoding:"base64"
                    })),
                    mimeType: image.mimetype
                }
            };
        }));

        const content = (await getImageContent(images))?.map(img => ({
            postid: postid,
            content: img,
            page: '0',
            document_id: `DOC_${crypto.randomBytes(16).toString('hex')}`
        }));
        if(content)
            content.forEach(page => ElasticSearch.insert(page.postid, page.content, page.page, page.document_id));

        
        


        
    }



    



    return { hello:"world" };
})