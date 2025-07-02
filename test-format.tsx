import React from 'react';

const TestComponent = () => {
  return (
    <div className="m-2 rounded-lg bg-red-500 p-4 text-white shadow-md transition-colors hover:bg-red-600">
      <h1 className="text-xl font-bold">Test Component</h1>
      <p className="mt-2">This is a test for prettier formatting.</p>
      <button
        className="mt-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        onClick={() => {
          console.log('Button clicked');
        }}
      >
        Click me
      </button>
    </div>
  );
};

export default TestComponent;
