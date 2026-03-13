/**
 * Function Name Extractor Service
 * Extracts function names from user code in different languages
 */

/**
 * Extract function name from JavaScript code
 */
function extractJavaScriptFunction(code) {
  // Match: function functionName( or const functionName = or let functionName =
  const patterns = [
    /function\s+(\w+)\s*\(/,           // function name()
    /const\s+(\w+)\s*=\s*function/,    // const name = function
    /let\s+(\w+)\s*=\s*function/,      // let name = function
    /const\s+(\w+)\s*=\s*\(/,          // const name = ()
    /let\s+(\w+)\s*=\s*\(/,            // let name = ()
    /var\s+(\w+)\s*=\s*function/,      // var name = function
    /var\s+(\w+)\s*=\s*\(/,            // var name = ()
  ];

  for (const pattern of patterns) {
    const match = code.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Extract function name from Python code
 */
function extractPythonFunction(code) {
  // Match: def function_name(
  const match = code.match(/def\s+(\w+)\s*\(/);
  return match ? match[1] : null;
}

/**
 * Extract function name from Java code
 */
function extractJavaFunction(code) {
  // Match: public static returnType functionName(
  const match = code.match(/public\s+(?:static\s+)?\w+\s+(\w+)\s*\(/);
  return match ? match[1] : null;
}

/**
 * Extract function name from C/C++ code
 */
function extractCFunction(code) {
  // Match: returnType functionName(
  // Exclude main function
  const matches = code.matchAll(/(?:int|void|float|double|char|long|short)\s+(\w+)\s*\(/g);
  for (const match of matches) {
    if (match[1] !== 'main') {
      return match[1];
    }
  }
  return null;
}

/**
 * Main function to extract function name based on language
 */
function extractFunctionName(code, language) {
  const lang = language.toLowerCase();

  switch (lang) {
    case 'javascript':
    case 'js':
    case 'node':
      return extractJavaScriptFunction(code);
    
    case 'python':
    case 'python3':
    case 'py':
      return extractPythonFunction(code);
    
    case 'java':
      return extractJavaFunction(code);
    
    case 'c':
    case 'cpp':
    case 'c++':
      return extractCFunction(code);
    
    default:
      return null;
  }
}

/**
 * Validate if function name exists in code
 */
function validateFunctionExists(code, functionName, language) {
  if (!functionName) return false;
  
  const lang = language.toLowerCase();
  
  if (lang === 'javascript' || lang === 'js') {
    return code.includes(`function ${functionName}`) || 
           code.includes(`const ${functionName}`) ||
           code.includes(`let ${functionName}`) ||
           code.includes(`var ${functionName}`);
  }
  
  if (lang === 'python' || lang === 'python3') {
    return code.includes(`def ${functionName}`);
  }
  
  return true;
}

module.exports = {
  extractFunctionName,
  validateFunctionExists,
};
