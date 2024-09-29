"use client";

import { Sidebar } from "flowbite-react";
import { House } from 'lucide-react';
import { Bookmark } from 'lucide-react';
import { LayoutDashboard } from 'lucide-react';
import { Bookmarks } from '../pages/Bookmarks';
import Post from "@/components/Post";

export function SidebarNav() {
  return (
  <Sidebar aria-label="Default sidebar example">
  <Sidebar.Items>
    <Sidebar.ItemGroup>
      <div className="flex flex-col justify-center items-center h-full">
        <div className="flex flex-col items-start space-y-3">
          <Sidebar.Item className='text-xl' href="#" icon={House}>
            <strong>Home</strong>
          </Sidebar.Item>

          <div className='flex justify-center items-center w-full'>
            <Sidebar.Item className='text-xl' href="#" icon={Bookmark} on>
              <Bookmarks />
            </Sidebar.Item>
          </div> 

          <Sidebar.Item className='text-xl' href="#" icon={LayoutDashboard}>
            <strong>Dashboard</strong>
          </Sidebar.Item>
        </div>

        <div className='flex mt-[140px] justify-center items-center w-full'>
          <Post />
        </div>
      </div>
    </Sidebar.ItemGroup>
  </Sidebar.Items>
</Sidebar>

  
  );
}