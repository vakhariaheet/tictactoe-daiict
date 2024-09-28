import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useAuth } from '@clerk/clerk-react'; // Import useAuth from Clerk
import axios from 'axios';

export default function SignUpPage() {
  const [value, setValue] = useState("student");
  const { getToken } = useAuth(); // Get the getToken function from useAuth

  const [semester, setSemester] = useState('');
  const [year, setYear] = useState('');
  const [course, setCourse] = useState('');
  const [university, setUniversity] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [bio, setBio] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    const authToken = await getToken();
    console.log("Token: ", authToken);

    const formData = { accountType: value, semester, year, course, university, specialization, bio };

    try {
       // Send the files to your backend for uploading to Cloudinary
      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'multipart/form-data',
        }
      });
      console.log("Upload response:", response.data); // Handle the response from your backend
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  return (
    <>
      <section className='flex justify-center items-center'>
        <form className='h-screen w-1/2 bg-slate-100 p-8'>
          <h2 className='text-center mb-6 text-xl font-semibold'>Complete Your Profile</h2>

          <div className='grid grid-cols-2 gap-4'>
            {/* Row 1: Full column for account type */}
            <div className='col-span-2'>
              <Label htmlFor="user">Select Account type</Label>
              <Select value={value} onValueChange={(value) => { setValue(value); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {value === "student" && (
              <>
                {/* Row 2: Semester and Year */}
                <div>
                  <Label htmlFor="sem">Semester</Label>
                  <Input type="text" id="sem" className='w-full' placeholder="Enter your Semester" value={semester} onChange={(e) => setSemester(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="year">Year</Label>
                  <Input type="text" id="year" className='w-full' placeholder="Enter your Year"value={year} onChange={(e) => setYear(e.target.value)} />
                </div>

                {/* Row 3: Course and University */}
                <div>
                  <Label htmlFor="course">Course</Label>
                  <Input type="text" id="course" className='w-full' placeholder="Enter your Course"value={course} onChange={(e) => (e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="university">University</Label>
                  <Input type="text" id="university" className='w-full' placeholder="Enter your University"value={} onChange={(e) => (e.target.value)} />
                </div>

                <div className='col-span-2'>
                  <Label htmlFor="specialization">Specialization</Label>
                  <Input type="text" id="specialization" className='col-span-2 w-full' placeholder="Enter your Specialization"value={} onChange={(e) => (e.target.value)} />
                </div>
              </>
            )}

            <div className='col-span-2'>
              <Label htmlFor="bio">Profile Description</Label>
              <Textarea id="bio" className='w-full' placeholder="Tell us about yourself."value={} onChange={(e) => (e.target.value)} />
            </div>

            <div className='col-span-2'>
              <Button className='w-full' variant="outline" >Submit</Button>
            </div>
          </div>
        </form>
      </section>
    </>
  );
}