import React, { 
  Component, 
  PureComponent, 
  useState, 
  useEffect, 
  useContext, 
  useReducer, 
  useCallback, 
  useMemo, 
  useRef, 
  useImperativeHandle, 
  useLayoutEffect, 
  useDebugValue,
  createContext, 
  createRef, 
  forwardRef, 
  memo, 
  lazy, 
  Suspense, 
  Fragment,
  StrictMode,
  createElement,
  cloneElement,
  isValidElement,
  Children
} from 'react';

// Context for demonstration
const ThemeContext = createContext('light');

// Custom hook with useDebugValue
function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);
  useDebugValue(count > 5 ? 'High' : 'Low');
  return [count, setCount];
}

// Reducer for useReducer demo
function counterReducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    case 'reset':
      return { count: 0 };
    default:
      return state;
  }
}

// Class Component demonstration
class ClassComponentDemo extends Component {
  constructor(props) {
    super(props);
    this.state = { message: 'Hello from Class Component!' };
  }

  render() {
    return (
      <div className="p-4 bg-blue-50 rounded-lg mb-4">
        <h3 className="font-bold text-blue-800">Class Component</h3>
        <p>{this.state.message}</p>
        <button 
          onClick={() => this.setState({ message: 'State updated!' })}
          className="mt-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Update State
        </button>
      </div>
    );
  }
}

// PureComponent demonstration
class PureComponentDemo extends PureComponent {
  render() {
    return (
      <div className="p-4 bg-green-50 rounded-lg mb-4">
        <h3 className="font-bold text-green-800">Pure Component</h3>
        <p>Props: {JSON.stringify(this.props)}</p>
        <p className="text-sm text-green-600">This component only re-renders when props change</p>
      </div>
    );
  }
}

// Lazy loaded component
const LazyComponent = lazy(() => 
  Promise.resolve({
    default: () => (
      <div className="p-4 bg-purple-50 rounded-lg">
        <h3 className="font-bold text-purple-800">Lazy Loaded Component</h3>
        <p>This component was loaded lazily!</p>
      </div>
    )
  })
);

// Forward ref component
const ForwardRefComponent = forwardRef((props, ref) => (
  <input 
    ref={ref}
    className="border border-gray-300 rounded px-3 py-2 w-full"
    placeholder="Forward ref input"
    {...props}
  />
));

// Memoized component
const MemoizedComponent = memo(({ value }) => {
  console.log('MemoizedComponent rendered');
  return (
    <div className="p-4 bg-yellow-50 rounded-lg mb-4">
      <h3 className="font-bold text-yellow-800">Memoized Component</h3>
      <p>Value: {value}</p>
      <p className="text-sm text-yellow-600">Check console - only renders when value changes</p>
    </div>
  );
});

// Component using useImperativeHandle
const ImperativeComponent = forwardRef((props, ref) => {
  const [count, setCount] = useState(0);
  
  useImperativeHandle(ref, () => ({
    reset: () => setCount(0),
    increment: () => setCount(c => c + 1),
    getCount: () => count
  }));

  return (
    <div className="p-4 bg-indigo-50 rounded-lg mb-4">
      <h3 className="font-bold text-indigo-800">Imperative Handle</h3>
      <p>Count: {count}</p>
    </div>
  );
});

// Main App Component
export default function ReactShowcase() {
  // useState demo
  const [basicCount, setBasicCount] = useState(0);
  const [theme, setTheme] = useState('light');
  
  // Custom hook with useDebugValue
  const [customCount, setCustomCount] = useCounter(0);
  
  // useReducer demo
  const [reducerState, dispatch] = useReducer(counterReducer, { count: 0 });
  
  // useRef demo
  const inputRef = useRef();
  const imperativeRef = useRef();
  
  // useCallback demo
  const handleClick = useCallback(() => {
    setBasicCount(prev => prev + 1);
  }, []);
  
  // useMemo demo
  const expensiveValue = useMemo(() => {
    console.log('Computing expensive value...');
    return basicCount * 2;
  }, [basicCount]);
  
  // useContext demo
  const contextValue = useContext(ThemeContext);
  
  // useEffect demo
  useEffect(() => {
    document.title = `Count: ${basicCount}`;
    return () => {
      document.title = 'React Showcase';
    };
  }, [basicCount]);
  
  // useLayoutEffect demo
  useLayoutEffect(() => {
    console.log('Layout effect ran');
  }, []);

  // createElement demo
  const createdElement = createElement('div', {
    className: 'p-4 bg-red-50 rounded-lg mb-4',
    key: 'created'
  }, 
    createElement('h3', { className: 'font-bold text-red-800' }, 'createElement Demo'),
    createElement('p', null, 'This div was created using React.createElement')
  );

  // cloneElement demo
  const originalElement = <span className="text-gray-600">Original element</span>;
  const clonedElement = cloneElement(originalElement, { 
    className: 'text-blue-600 font-bold' 
  });

  // Children utilities demo
  const childrenArray = ['First', 'Second', 'Third'];

  return (
    <StrictMode>
      <ThemeContext.Provider value={theme}>
        <div className="mx-auto p-6 bg-gray-50 min-h-screen">
          <h1 className="text-3xl font-bold mb-6 text-center">React Package Showcase</h1>
          <p className="text-center mb-8 text-gray-600">
            Demonstrating all major exports from the React package
          </p>

          {/* Theme Toggle */}
          <div className="mb-6 text-center">
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
            >
              Theme: {theme} (Context: {contextValue})
            </button>
          </div>

          {/* Hooks Demonstrations */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-white rounded-lg shadow">
              <h3 className="font-bold mb-3">Hooks Demo</h3>
              
              <div className="space-y-3">
                <div>
                  <strong>useState:</strong> {basicCount}
                  <button 
                    onClick={handleClick}
                    className="ml-2 px-2 py-1 bg-blue-500 text-white rounded text-sm"
                  >
                    +
                  </button>
                </div>
                
                <div>
                  <strong>useMemo:</strong> Expensive value = {expensiveValue}
                </div>
                
                <div>
                  <strong>Custom Hook (useDebugValue):</strong> {customCount}
                  <button 
                    onClick={() => setCustomCount(customCount + 1)}
                    className="ml-2 px-2 py-1 bg-green-500 text-white rounded text-sm"
                  >
                    +
                  </button>
                </div>
                
                <div>
                  <strong>useReducer:</strong> {reducerState.count}
                  <div className="mt-1">
                    <button 
                      onClick={() => dispatch({ type: 'increment' })}
                      className="mr-1 px-2 py-1 bg-purple-500 text-white rounded text-sm"
                    >
                      +
                    </button>
                    <button 
                      onClick={() => dispatch({ type: 'decrement' })}
                      className="mr-1 px-2 py-1 bg-red-500 text-white rounded text-sm"
                    >
                      -
                    </button>
                    <button 
                      onClick={() => dispatch({ type: 'reset' })}
                      className="px-2 py-1 bg-gray-500 text-white rounded text-sm"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white rounded-lg shadow">
              <h3 className="font-bold mb-3">useRef & Imperative Handle</h3>
              <div className="space-y-3">
                <ForwardRefComponent ref={inputRef} />
                <button 
                  onClick={() => inputRef.current?.focus()}
                  className="px-3 py-1 bg-indigo-500 text-white rounded"
                >
                  Focus Input (useRef)
                </button>
                
                <ImperativeComponent ref={imperativeRef} />
                <div>
                  <button 
                    onClick={() => imperativeRef.current?.increment()}
                    className="mr-1 px-2 py-1 bg-green-500 text-white rounded text-sm"
                  >
                    Increment
                  </button>
                  <button 
                    onClick={() => imperativeRef.current?.reset()}
                    className="px-2 py-1 bg-red-500 text-white rounded text-sm"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Component Types */}
          <ClassComponentDemo />
          <PureComponentDemo data={{ timestamp: Math.floor(Date.now() / 10000) }} />
          <MemoizedComponent value={Math.floor(basicCount / 3)} />

          {/* createElement demo */}
          {createdElement}

          {/* cloneElement demo */}
          <div className="p-4 bg-orange-50 rounded-lg mb-4">
            <h3 className="font-bold text-orange-800 mb-2">cloneElement Demo</h3>
            <p>Original: {originalElement}</p>
            <p>Cloned: {clonedElement}</p>
          </div>

          {/* Children utilities demo */}
          <div className="p-4 bg-teal-50 rounded-lg mb-4">
            <h3 className="font-bold text-teal-800 mb-2">Children Utilities</h3>
            <p>Count: {Children.count(childrenArray)}</p>
            <div>
              Mapped: {Children.map(childrenArray, (child, index) => (
                <span key={index} className="mr-2 px-2 py-1 bg-teal-200 rounded text-sm">
                  {child}
                </span>
              ))}
            </div>
          </div>

          {/* isValidElement demo */}
          <div className="p-4 bg-pink-50 rounded-lg mb-4">
            <h3 className="font-bold text-pink-800 mb-2">isValidElement Demo</h3>
            <p>Is div element valid? {isValidElement(<div>test</div>) ? 'Yes' : 'No'}</p>
            <p>Is string valid? {isValidElement('test') ? 'Yes' : 'No'}</p>
          </div>

          {/* Fragment demo */}
          <div className="p-4 bg-gray-100 rounded-lg mb-4">
            <h3 className="font-bold text-gray-800 mb-2">Fragment Demo</h3>
            <Fragment>
              <p>This paragraph is inside a Fragment</p>
              <p>So is this one - no extra wrapper div!</p>
            </Fragment>
          </div>

          {/* Suspense and Lazy demo */}
          <div className="mb-4">
            <h3 className="font-bold mb-2">Suspense & Lazy Loading</h3>
            <Suspense fallback={
              <div className="p-4 bg-gray-200 rounded-lg animate-pulse">
                Loading lazy component...
              </div>
            }>
              <LazyComponent />
            </Suspense>
          </div>

          <div className="text-center text-sm text-gray-500 mt-8">
            <p>This showcase demonstrates most of React's core exports including:</p>
            <p className="mt-1">
              Hooks, Class Components, Context, Refs, Memoization, Lazy Loading, 
              createElement, cloneElement, Children utilities, and more!
            </p>
          </div>
        </div>
      </ThemeContext.Provider>
    </StrictMode>
  );
}