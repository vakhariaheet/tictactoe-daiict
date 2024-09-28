import { useState } from 'react';
import { FileUploader } from "react-drag-drop-files"; // Import FileUploader
import { Button } from "@/components/ui/button"; // Import Button component
import { useAuth } from '@clerk/clerk-react'; // Import useAuth from Clerk
import axios from 'axios'; // Import Axios

const fileTypes = ["JPG", "PNG", "GIF", "PDF"];

export default function FileUpload({ onUpload }) {
    const [files, setFiles] = useState<File[]>([]);
    const [showSuccess, setShowSuccess] = useState(false); // State for success message
    const [fileUrls, setFileUrls] = useState<string[]>([]); // State for storing file URLs
    const { getToken } = useAuth(); // Get the getToken function from useAuth

    // Handler for file upload
    const handleChange = (uploadedFiles: File[]) => {
        setFiles([...uploadedFiles]);  // Store all uploaded files in the state
        console.log(uploadedFiles);
        onUpload(uploadedFiles.length > 0);  // Notify parent component that files are uploaded
    };

    // Handler for submitting files
    const handleSubmit = async () => {
        const authToken = await getToken();
        console.log("Token: ", authToken);

        try {
            const formData = new FormData();
            files.forEach(file => formData.append('file', file)); // Append each file to form data

            // Send the files to your backend for uploading to Cloudinary
            const response = await axios.post('/api/upload', formData, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'multipart/form-data',
                }
            });

            console.log("Upload response:", response.data); // Handle the response from your backend

            // Get URLs of uploaded files
            const urls = response.data.results.map((file) => file.secure_url);
            setFileUrls(urls); // Store the URLs
            setShowSuccess(true); // Show success message
        } catch (error) {
            console.error("Upload failed:", error);
        }
        
        // Reset the files after submission (optional)
        setFiles([]);
        onUpload(false); // Notify parent that no files are uploaded
    };

    // Close the success message after a few seconds
    const closeSuccessMessage = () => {
        setShowSuccess(false);
    };

    return (
        <div className="file-uploader">
            <h3>Upload your files</h3>
            <FileUploader handleChange={handleChange} name="file[]" multiple types={fileTypes} />
            {files.length > 0 && (
                <div className="file-details">
                    <h4>Uploaded Files:</h4>
                    {files.map((uploadedFile, index) => (
                        <p key={index}>
                            <strong>Name:</strong> {uploadedFile.name}, <br />
                            <strong>Type:</strong> {uploadedFile.type},<br />
                            <strong>Size:</strong> {(uploadedFile.size / 1024).toFixed(2)} KB
                        </p>
                    ))}
                </div>
            )}
            {/* Submit button */}
            <Button onClick={handleSubmit} className="submit-button">Submit</Button>

            {/* Success Message Popup */}
            {showSuccess && (
                <div className="success-popup">
                    <p>Files uploaded successfully!</p>
                    {fileUrls.map((url, index) => (
                        <p key={index}>File URL: <a href={url} target="_blank" rel="noopener noreferrer">{url}</a></p>
                    ))}
                    <button onClick={closeSuccessMessage}>Close</button>
                </div>
            )}
        </div>
    );
}
