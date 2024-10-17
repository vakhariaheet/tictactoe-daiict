// FileUpload.tsx
import { useState } from 'react';
import { FileUploader } from "react-drag-drop-files"; // Import FileUploader
import { Button } from "@/components/ui/button"; // Import Button component
import { useAuth } from '@clerk/clerk-react'; // Import useAuth from Clerk
import { toast } from '@/hooks/use-toast';

// Define the allowed file types for the uploader
const fileTypes = ["JPG", "PNG", "GIF", "PDF"];
const cloudinaryUrl = 'https://api.cloudinary.com/v1_1/fanfic2book/image/upload'; // Use your Cloudinary URL
const uploadPreset = 'daiict'; // Replace with your upload preset

// Define prop types for the component
interface FileUploadProps {
    editorContent: string;
    setShow: any;  // Assuming editorContent is a string of HTML or text
}

// Define File type
interface UploadedFile {
  name: string;
  type: string;
  size: number;
}

export default function FileUpload({ editorContent }: FileUploadProps) { // Properly type the props
    const [files, setFiles] = useState<UploadedFile[]>([]); // State for storing uploaded files
    const [showSuccess, setShowSuccess] = useState(false); // State for success message
    const { getToken } = useAuth(); // Get the getToken function from useAuth

    // Handler for file upload
    const handleChange = (uploadedFiles: UploadedFile[]) => {
        setFiles([...uploadedFiles]);  // Store all uploaded files in the state
        console.log(uploadedFiles);
    };

    // Handler for submitting files
    const handleSubmit = async () => {
        const authToken = await getToken();
        console.log("Token: ", authToken);

        try {
            const formData = new FormData();
            files.forEach(file => {
                formData.append('file', file as any); // Append each file to form data
                formData.append('upload_preset', uploadPreset);
                formData.append('public_id', file.name);
            });

            

            console.log("Sending data to Cloudinary:", formData);
            // Send the files to Cloudinary using fetch
            const response = await fetch(cloudinaryUrl, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }
            console.log("Cloudinary response status:", response.status);
            const data = await response.json(); // Parse JSON response
            console.log("Upload response:", data); // Log the response

            // Prepare the files array for the backend
            const filesToSend = files.map(file => ({
                mimetype: file.type, // Get mimetype from the original files array
                url: data.secure_url // Correctly access the URL from the response
            }));

            // Forward the files and content (from editor) to your backend
            const backendResponse = await fetch('http://localhost:4000/post', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`, // Pass the token if needed
                },
                body: JSON.stringify({
                    files: filesToSend, // Send the files array
                    content: editorContent // Send the editor content here
                }),
            });
            toast({
                title: 'Post Created',
                description: 'Your post has been created successfully! 🎉. Please note it ',
                
                duration: 5000,
                
            });
            // Log response details
            console.log("Backend response status:", backendResponse.status);
            const backendResponseData = await backendResponse.json(); // Parse response data
            console.log("Backend response body:", backendResponseData);

            if (!backendResponse.ok) {
                throw new Error(`Failed to forward data to backend: ${backendResponseData.message || 'Unknown error'}`);
            }

            setShowSuccess(true); // Show success message
        } catch (error) {
            console.error("Upload failed:", error);
        }

        // Reset the files after submission (optional)
        setFiles([]);
    };

    // Close the success message
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
                    <button onClick={closeSuccessMessage}>Close</button>
                </div>
            )}
        </div>
    );
}
