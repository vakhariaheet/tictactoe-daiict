// Editor.js
import { useRef, useState, useEffect } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import {
    ClassicEditor,
    AccessibilityHelp,
    Autoformat,
    AutoLink,
    Autosave,
    BlockQuote,
    Bold,
    CodeBlock,
    Essentials,
    GeneralHtmlSupport,
    Italic,
    Link,
    Paragraph,
    PasteFromOffice,
    SelectAll,
    TextTransformation,
    Underline,
    Undo
} from 'ckeditor5';

import 'ckeditor5/ckeditor5.css';
import '../App.css';

export default function Editor({setEditorContent}) {
    const editorContainerRef = useRef(null);
    const editorRef = useRef(null);
    const [isLayoutReady, setIsLayoutReady] = useState(false);

    useEffect(() => {
        setIsLayoutReady(true);
        return () => setIsLayoutReady(false);
    }, []);

    const editorConfig = {
        toolbar: {
            items: ['undo', 'redo', '|', 'bold', 'italic', 'underline', '|', 'link', 'blockQuote', 'codeBlock'],
            shouldNotGroupWhenFull: false
        },
        plugins: [
            AccessibilityHelp,
            Autoformat,
            AutoLink,
            Autosave,
            BlockQuote,
            Bold,
            CodeBlock,
            Essentials,
            GeneralHtmlSupport,
            Italic,
            Link,
            Paragraph,
            PasteFromOffice,
            SelectAll,
            TextTransformation,
            Underline,
            Undo
        ],
        htmlSupport: {
            allow: [
                {
                    name: /^.*$/,
                    styles: true,
                    attributes: true,
                    classes: true
                }
            ]
        },
        initialData: '',
        link: {
            addTargetToExternalLinks: true,
            defaultProtocol: 'https://',
            decorators: {
                toggleDownloadable: {
                    mode: 'manual',
                    label: 'Downloadable',
                    attributes: {
                        download: 'file'
                    }
                }
            }
        },
        placeholder: 'Type or paste your content here!'
    };

    return (
        <div className="editor-container editor-container_classic-editor" ref={editorContainerRef}>
            <div className="editor-container__editor">
                <div ref={editorRef}>
                    {isLayoutReady && <CKEditor onChange={(e,editor) => {
                        const data = editor.getData();
                        setEditorContent(data);
                    }} editor={ClassicEditor} config={editorConfig} />}
                </div>
            </div>
        </div>
    );
}
