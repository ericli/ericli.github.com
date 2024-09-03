import React from 'react';
import DraggableStickerNavigation from './components/DraggableStickerNavigation';


function App() {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-grow relative">
          <DraggableStickerNavigation />
        </main>
      </div>
    );
  }
  

export default App;