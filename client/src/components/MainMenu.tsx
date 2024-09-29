import { Input } from "@/components/ui/input";
import { useState } from "react";
import { FiSearch } from 'react-icons/fi';
import logo from '../assets/peerhive_logo.png';
import { UserButton } from '@clerk/clerk-react';
import { Sparkles } from 'lucide-react';
import { Search } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function MainMenu() {
  const [inputValue, setInputValue] = useState(''); // State for input value

  return (
    <div className="flex justify-between items-center mx-6">
      <img src={logo} className="h-20 w-35" alt="Logo" />

      <div className="relative w-1/3" title="Search">
        <button className="absolute left-4 top-4 transform -translate-y-1/2 flex items-center">
          <Search className="stroke-black"/>
        </button>
        <Input
        className="pl-12 w-full text-l bg-white border-black border-2 rounded-2xl" 
        placeholder="Search"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)} // Update state on input change
      />
      
      {/* Step 3: Conditionally render the button on the right side */}
      {inputValue && (
        <button className="absolute inset-y-0 right-4 flex items-center p-2 bg-transparent rounded-full hover:stroke-gray-300 transition duration-200" title="Search With AI">
          <Sparkles className="stroke1-1-black scale-65"/>
        </button>
      )}
      </div>

      <UserButton appearance={{
          elements: {
            rootBox: 'rounded-full', // Root button styling
            avatarBox: 'w-12 h-12', // Custom height and width for the avatar box
            avatarImage: 'rounded-full w-full h-full', // Ensure the avatar image fits inside the box
          },
      }} />
    </div>
  );
};
