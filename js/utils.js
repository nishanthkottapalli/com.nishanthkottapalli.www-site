const removePrefix = (str, prefix) => 
  str.startsWith(prefix) ? str.slice(prefix.length) : str;