# Ragamaie's Components

This folder is for Ragamaie's React components.

## Structure:
```
src/components/ragamaie/
├── YourComponent1.jsx
├── YourComponent2.jsx
└── README.md
```

## Usage:
1. Create your components in this folder
2. Import them in App.jsx like: `import YourComponent from './components/ragamaie/YourComponent';`
3. Add them to the App component

## Example:
```jsx
// YourComponent.jsx
import React from 'react';

const YourComponent = () => {
  return (
    <div>
      <h1>Ragamaie's Component</h1>
    </div>
  );
};

export default YourComponent;
```
