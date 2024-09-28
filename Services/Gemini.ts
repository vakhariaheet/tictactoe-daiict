import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs/promises';
import pdf from 'pdf-page-counter';
import { fromPath } from 'pdf2pic';
import log from 'encore.dev/log';
import { paginate } from '../utils/utils';
import { secret } from 'encore.dev/config';



const genAI = new GoogleGenerativeAI(
	secret('GoogleGenerativeAIKey')(),
);

interface FileAttachment {
	inlineData: {
		data: string;
		mimeType: string;
	};
}

export const getBookContent = async (inputPath: string) => {
	

	const content = await fs.readFile(inputPath);
	const pdfInfo = await pdf(content);
	const outputDir = './tmp/output';
	// Create the output directory if it doesn't exist
	await fs.mkdir(outputDir, { recursive: true });
	// Default options
	const defaultOptions: Parameters<typeof fromPath>['1'] = {
		density: 100,
		saveFilename: 'page',
		quality: 100,
		format: 'png',
		savePath: outputDir,
	};

	// Merge default options with user-provided options
	const finalOptions = { ...defaultOptions, ...defaultOptions };

	// Initialize the converter
	const convert = fromPath(inputPath, finalOptions);

	// Convert each page to an image
	for (let i = 1; i <= pdfInfo.numpages; i++) {
		await convert(i);
		log.info(`Converted page ${i} to image`);
	}
	const files = await fs.readdir(outputDir, {
		recursive: false,
	});

	const attactments: FileAttachment[] = new Array(pdfInfo.numpages).fill([]);

	for (const file of files) {
		console.log(`Uploading ${file} to Google AI`);
		const fileIndex = Number(file.split('.')[1]);
		console.log(fileIndex);
		const fileData = await fs.readFile(`${outputDir}/${file}`);

		attactments[fileIndex - 1] = {
			inlineData: {
				data: fileData.toString('base64'),
				mimeType: 'image/png',
			},
		};
	}

	const pdfPages: string[] = [];
	const resps = await Promise.all(
		paginate(attactments, 10).map(async (batch, i) => {
			const pages = await getImageContent(batch);
            pdfPages.push(...(pages || []));
            return pages;
		}),
	);
	return resps;
};

export const getImageContent = async (attactments: FileAttachment[]) => {
	const prompt = `Extract the plain text content from a batch of images representing pages from a book. Maintain a clear and consistent distinction between pages by inserting a custom separator (e.g., ===PAGE BREAK===) between each page's content. Ensure that the text is extracted accurately with no additional formatting like Markdown or HTML. Keep only the raw text, without any styling or special characters beyond basic punctuation.`;
	const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    const { response } = await model.generateContent([ prompt, ...attactments ]);
    const pages = response.candidates?.[0].content.parts[0].text?.split('===PAGE BREAK===').map((page: string) => page.trim());
    return pages;
};
