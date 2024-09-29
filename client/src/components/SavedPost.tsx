import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { useAuth } from '@clerk/clerk-react';

export default function SavedPost() {
  const { getToken } = useAuth();
  const [collections, setCollections] = React.useState<string[]>(['My']);
  const [newCollectionName, setNewCollectionName] = React.useState('');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filteredCollections, setFilteredCollections] = React.useState<string[]>(['My']);
  const [selectedCollection, setSelectedCollection] = React.useState<string | null>(null);

  const API_URL = 'http://localhost:4000/profile/lists';

  React.useEffect(() => {
    const fetchCollections = async () => {
      try {
        const token = await getToken();
        const response = await fetch(`${API_URL}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();

        if (response.ok) {
          const fetchedCollections = data.data.map((coll: any) => coll.list_name) || [];
          setCollections((prev) => [...prev, ...fetchedCollections]);
          setFilteredCollections((prev) => [...prev, ...fetchedCollections]);
        } else {
          console.error('Error fetching collections:', data.message);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchCollections();
  }, [getToken]);

  const handleCreateCollection = async () => {
    if (newCollectionName.trim() !== '') {
      try {
        const token = await getToken();
        const response = await fetch('http://localhost:4000/profile/add-list', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: newCollectionName }),
        });
        const data = await response.json();

        if (response.ok) {
          setCollections((prev) => [...prev, newCollectionName]);
          setFilteredCollections((prev) => [...prev, newCollectionName]);
          setNewCollectionName('');
        } else {
          console.error('Error creating collection:', data.message);
        }
      } catch (error) {
        console.error('Error creating collection:', error);
      }
    }
  };

  const handleSelectCollection = (collection: string) => {
    setSelectedCollection(collection);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredCollections(collections);
    } else {
      setFilteredCollections(
        collections.filter((col) => col.toLowerCase().includes(query.toLowerCase()))
      );
    }
  };

  const handleSavePostToCollection = async () => {
    if (selectedCollection) {
      try {
        const token = await getToken();
        const response = await fetch('http://localhost:4000/profile/save-post', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ collection: selectedCollection }),
        });
        const data = await response.json();

        if (response.ok) {
          console.log(`Post saved to collection: ${selectedCollection}`);
        } else {
          console.error('Error saving post to collection:', data.message);
        }
      } catch (error) {
        console.error('Error saving post to collection:', error);
      }
    }
  };

  return (
    <>
      <Drawer>
        <DrawerTrigger asChild>
          <Button variant='default'>Save to Collection</Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Choose a Collection</DrawerTitle>
            <DrawerDescription>
              Select or create a new collection to save your post.
            </DrawerDescription>
          </DrawerHeader>

          <div>
            <Input
              placeholder='Search collections...'
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
            <div className='mt-4'>
              {filteredCollections.map((collection) => (
                <Button
                  key={collection}
                  variant={selectedCollection === collection ? 'default' : 'outline'} // Changed "solid" to "default"
                  onClick={() => handleSelectCollection(collection)}
                >
                  {collection}
                </Button>
              ))}
            </div>
          </div>

          <DrawerFooter>
            <Button
              disabled={!selectedCollection}
              onClick={handleSavePostToCollection}
            >
              Save Post
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <div className='mt-6'>
        <h2>Create a New Collection</h2>
        <Input
          placeholder='New collection name...'
          value={newCollectionName}
          onChange={(e) => setNewCollectionName(e.target.value)}
        />
        <Button onClick={handleCreateCollection} className='mt-4'>
          Create Collection
        </Button>
      </div>
    </>
  );
}
